import {catalogProducts} from './catalog'
import type {StoreImage} from './content'
const descriptions:Record<string,string>={
 'oversized-black':'Uma presença marcante em preto, com estampa rosa FormFisik. A proposta oversized leva a identidade da marca do treino para o dia a dia.',
 'compression-lava':'Preto e laranja em uma estampa inspirada na força da lava. Uma proposta visual intensa para a linha de compressão FormFisik.',
 'compression-fk':'Visual preto com assinatura FK em branco. Uma proposta essencial da linha de compressão FormFisik.',
 bone:'Aba roxa, detalhes verde neon e arte zumbi: um acessório para carregar a mentalidade FormFisik.',
 straps:'Straps pretos com assinatura FormFisik e detalhes verde neon. Uma prévia dos acessórios da marca para a rotina de treino.',
 bolsa:'Uma prévia da bolsa de treino FormFisik em preto com detalhes verde neon. A imagem apresenta também outros itens da coleção de bolsas.',
 toalha:'Toalha preta com assinatura FK e acabamento verde neon. Identidade FormFisik nos detalhes da rotina.',
 garrafa:'Uma prévia das garrafas FormFisik em preto, branco, verde neon e rosa. As opções finais serão confirmadas no lançamento.',
 munhequeira:'Preto com faixas rosa neon e assinatura FK branca. Uma prévia da munhequeira da coleção FormFisik.',
}
export function getStoreProduct(slug:string){const item=catalogProducts.find(product=>product.id===slug);if(!item)return undefined;return {...item,description:descriptions[item.id],images:(item.image?[item.image]:[]) as StoreImage[],priceCents:null,currency:'BRL' as const,availability:'coming_soon' as const}}
