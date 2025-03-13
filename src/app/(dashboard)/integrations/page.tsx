'use client'
import { useEffect, useState } from 'react';
import { fetchAdAccounts } from './ad-accounts';
import { MoreVertical, Plug, Plus, Settings } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { CardWrapper } from '@/components/layout/card-wrapper';
import { Modal } from '@/components/layout/modal';
import { toast } from 'sonner';
import { FacebookIcon, GoogleAdSenseIcon } from '@/components/layout/brand-icons';
import { Separator } from '@/components/ui/separator';

export default function AdAccounts() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const myPromise = new Promise<{ name: string }>((resolve) => {
        setTimeout(() => {
            resolve({ name: 'My toast' });
        }, 3000);
    });

    const handleConnectFacebook = () => {
      // Lógica para conectar a conta do Facebook
      handleClose(); // Fecha o modal após conectar    
      
      toast.promise(myPromise, {
        loading: 'Loading...',
        success: (data: { name: string }) => {
          return "Conectado ao Facebook com sucesso";
        },
        error: 'Error',
      });
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetchAdAccounts();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (error) return <p>Error loading ads accounts</p>;
    if (loading) return <p>Loading...</p>;

    return (
        <div className='space-y-8'>
            <div className='flex flex-row items-center justify-between pb-2'>
                <h1 className='text-2xl font-bold'>Integrations</h1>
                <Button 
                    className='cursor-pointer pr-4'
                    onClick={handleOpen}
                >   
                    <Plus />
                    Connect account
                </Button>
            </div>
            <div className='flex flex-col gap-2'>
                <Card className="rounded-md flex flex-col">
                    <CardHeader className='flex flex-row items-center justify-between gap-2'>
                        <div className='flex flex-row items-center gap-4'>
                            <span className='p-2 rounded-md border size-[38px]'>
                                <FacebookIcon size={20} />
                            </span>
                            <div>
                                <span className='text-sm text-muted-foreground'>Facebook</span>
                                <h3 className='text-base leading-none'>Roberto Merbach</h3>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Badge variant="outline"  className='border-green-500 text-green-500'>Connected</Badge>
                            <Button variant="ghost" size="icon" className='cursor-pointer'>
                                <Settings  />
                            </Button>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            {/* <CardContent>
                        <div className='space-y-4 grid divide-y'>
                        {data.data.map((account: any) => (
                            <div key={account.id} className='flex flex-col gap-2 pb-5'>                        
                                <div className='flex items-center justify-between gap-2'>
                                    <div className='flex flex-col gap-1'>
                                        <h3 className='text-base font-bold'>{account.name}</h3>
                                        <div className='flex items-center gap-2'>
                                            <Badge variant={account.account_status === 1 ? "default" : "destructive"}>{account.account_status === 1 ? "Active" : "Inactive"}</Badge>
                                            <p className='text-sm text-muted-foreground'>Currency: {account.currency}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <Switch
                                            id='account'
                                            disabled
                                            aria-readonly
                                        />
                                        <Button variant="ghost" size="icon" className='cursor-pointer'>
                                            <MoreVertical className='size-4' />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    </CardContent> */}
            
            <Modal
                title="Connect Account"
                isOpen={isOpen}
                onClose={handleClose}
                content={
                    <div className="space-y-4">
                        <div className="p-3 border shadow rounded-md flex items-center justify-between">
                            <div className="flex flex-row items-center gap-4">
                                <span className="rounded-md border p-2">
                                    <FacebookIcon size={20}  />
                                </span>
                                <div className="flex flex-col ">
                                    <h4 className="text-base font-bold leading-none">Facebook</h4>
                                </div>
                            </div>
                            <Button
                                className="cursor-pointer pr-4"
                                onClick={handleConnectFacebook} 
                            >
                                <Plug />
                                Connect
                            </Button>
                        </div>
                        <div className="p-3 border shadow rounded-md flex items-center justify-between">
                            <div className="flex flex-row items-center gap-4">
                                <span className="rounded-md border p-2">
                                    <GoogleAdSenseIcon size={20}  />
                                </span>
                                <div className="flex flex-col ">
                                    <h4 className="text-base font-bold leading-none">Google Adsense</h4>
                                </div>
                            </div>
                            <Button
                                className="cursor-pointer pr-4"
                                onClick={handleConnectFacebook} 
                            >
                                <Plug />
                                Connect
                            </Button>
                        </div>
                    </div>
                }
            />
        </div>
    );
}