import Image from 'next/image'
export function MarketingBrand({className,decorative=false}:{className?:string;decorative?:boolean}){
 return <Image className={className} src="/images/nomelogo.png" alt={decorative?'':'FormFisik'} width={2488} height={292} sizes="185px"/>
}
