export type StoreImage={src:string;alt:string;width:number;height:number}
export const storeImages={
 bag:{src:'/images/store/kit-bag.png',alt:'Coleção de bolsas FormFisik pretas com detalhes verde neon',width:1254,height:1254},
 towel:{src:'/images/store/kit-towel.png',alt:'Atleta com toalha FormFisik preta e acabamento verde neon',width:1115,height:1411},
 bottles:{src:'/images/store/kit-bottles.png',alt:'Garrafas FormFisik nas cores preta, branca, verde neon e rosa',width:1254,height:1254},
 wristband:{src:'/images/store/kit-wristband.png',alt:'Munhequeira FormFisik preta com faixas rosa neon',width:1254,height:1254},
 straps:{src:'/images/store/straps-neon.png',alt:'Strap FormFisik preto e verde neon em uso na barra',width:1122,height:1402},
 white:{src:'/images/store/oversized-white.jpg',alt:'Camiseta oversized branca FormFisik vista de frente e costas',width:1312,height:1199},
 oversized:{src:'/images/store/oversized-black.png',alt:'Modelo com camiseta oversized preta FormFisik e estampa rosa',width:1122,height:1402},
 compression:{src:'/images/store/category-compression.png',alt:'Camiseta de compressão preta com logo FK',width:1086,height:1448},
 accessories:{src:'/images/store/category-accessories.png',alt:'Boné e straps FormFisik sobre concreto',width:1254,height:1254},
 supplements:{src:'/images/store/category-supplements.png',alt:'Arte conceitual de embalagens da linha de suplementação FormFisik',width:1536,height:1024},
 lava:{src:'/images/store/compression-lava.png',alt:'Modelo com camiseta de compressão preta e estampa lava laranja',width:1229,height:1280},
 cap:{src:'/images/store/cap-zombie.png',alt:'Boné FormFisik com aba roxa e patch zumbi verde',width:1254,height:1254},
} satisfies Record<string,StoreImage>
export const storeCategories=[
 {image:storeImages.white,id:'oversized',name:'Oversized',href:'/store/roupas?tipo=oversized',caption:'Liberdade para vestir sua atitude.'},
 {image:storeImages.compression,id:'compressao',name:'Compressão',href:'/store/roupas?tipo=compressao',caption:'Sua rotina em movimento.'},
 {image:storeImages.accessories,id:'acessorios',name:'Acessórios',href:'/store/acessorios',caption:'Identidade em cada detalhe.'},
 {image:storeImages.supplements,id:'suplementacao',name:'Suplementação',href:'/store/suplementacao',caption:'Uma nova linha em preparação.'},
]
export const desiredProducts=[{image:storeImages.oversized,id:'oversized-black',name:'Oversized FormFisik Black',category:'Oversized'},{image:storeImages.lava,id:'compression-lava',name:'Compression Lava',category:'Compressão'},{image:storeImages.cap,id:'bone',name:'Boné FormFisik',category:'Acessórios'},{image:storeImages.straps,id:'straps',name:'Straps de Treino',category:'Acessórios'},{image:storeImages.compression,id:'compression-fk',name:'Compression FK Black',category:'Compressão'}]
export const kitProducts=[{image:storeImages.bag,id:'bolsa',name:'Bolsa de Treino FormFisik',category:'Kit de treino'},{image:storeImages.towel,id:'toalha',name:'Toalha Performance',category:'Kit de treino'},{image:storeImages.bottles,id:'garrafa',name:'Garrafa FormFisik 1L',category:'Kit de treino'},{image:storeImages.wristband,id:'munhequeira',name:'Munhequeira Performance',category:'Kit de treino'}]
