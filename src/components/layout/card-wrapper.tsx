import {  Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface CardWrapperProps {
    title: string
    content: React.ReactNode
    action?: React.ReactNode
    footer?: React.ReactNode
}

export function CardWrapper({title, content, action, footer}: CardWrapperProps) {
    return (
        <Card className="rounded-md gap-0 py-4">
            <CardHeader className="flex flex-row gap-2 justify-between items-center p-4 pt-0">
                <CardTitle>{title}</CardTitle>
                {action}
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
                {content}
            </CardContent>
            {footer && (
                <>
                    <Separator />
                    <CardFooter className="p-4 pb-0">
                        {footer}
                    </CardFooter>
                </>
            )}
        </Card>
    )
}
