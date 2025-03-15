// app/api/auth/password/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hash, compare } from "bcrypt";
import { z } from "zod";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

// Schema para recuperação de senha
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Schema para redefinição de senha
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100),
});

// Schema para alteração de senha (usuário logado)
const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(100),
});

// POST: Solicitar recuperação de senha
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validação do email
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }
    
    const { email } = validation.data;
    
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // Mesmo que o usuário não exista, retornamos uma resposta de sucesso
    if (!user) {
      return NextResponse.json(
        { message: "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha." },
        { status: 200 }
      );
    }
    
    // Gerar token de redefinição de senha
    const resetToken = randomUUID();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Expira em 1 hora
    
    // Salvar token diretamente no usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });
    
    // Enviar email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: "Redefinição de Senha",
      html: `
        <h1>Redefinição de Senha</h1>
        <p>Olá ${user.name || "usuário"},</p>
        <p>Você solicitou a redefinição de senha para sua conta no Dashboard.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetLink}">Redefinir Senha</a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou esta redefinição, ignore este email.</p>
      `,
    });
    
    return NextResponse.json(
      { message: "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao processar solicitação de recuperação de senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PATCH: Redefinir senha (com token) ou alterar senha (usuário logado)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    
    // Verificar se é redefinição com token ou alteração de senha
    if (body.token) {
      // Redefinição com token
      const validation = resetPasswordSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: validation.error.format() },
          { status: 400 }
        );
      }
      
      const { token, password } = validation.data;
      
      // Verificar se o token é válido
      const user = await prisma.user.findFirst({
        where: { 
          resetToken: token,
          resetTokenExpires: { gt: new Date() },
        }
      });
      
      if (!user) {
        return NextResponse.json(
          { error: "Token inválido ou expirado" },
          { status: 400 }
        );
      }
      
      // Hash da nova senha
      const hashedPassword = await hash(password, 12);
      
      // Atualizar senha do usuário e limpar token
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          resetToken: null,
          resetTokenExpires: null
        }
      });
      
      return NextResponse.json(
        { message: "Senha redefinida com sucesso" },
        { status: 200 }
      );
    } else {
      // Alteração de senha (usuário logado)
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
      }
      
      const validation = changePasswordSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: validation.error.format() },
          { status: 400 }
        );
      }
      
      const { currentPassword, newPassword } = validation.data;
      
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      });
      
      if (!user || !user.password) {
        return NextResponse.json(
          { error: "Usuário não encontrado ou não possui senha" },
          { status: 400 }
        );
      }
      
      // Verificar se a senha atual está correta
      const isPasswordValid = await compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Senha atual incorreta" },
          { status: 400 }
        );
      }
      
      // Hash da nova senha
      const hashedPassword = await hash(newPassword, 12);
      
      // Atualizar senha
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      
      return NextResponse.json(
        { message: "Senha alterada com sucesso" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Erro ao processar alteração de senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
