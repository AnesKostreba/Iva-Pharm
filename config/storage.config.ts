export const StorageConfig ={
    photo: {
        destination: '../storage/photos/',
        urlPrefix: '/assets/photos',
        maxAge: 1000 * 60 * 60 * 24 * 7, // slika mora biti kesirana 7 dana. Ucitace se ista slika iz kesa internet pregledaca u roku od 7 dana nece se uraditi redownload,
        maxSize: 3 * 1024 * 1024, // 3 MB u bajtovima
        resize: {
            thumb:{
                width: 110 , 
                height: 160,
                directory: 'thumb/'
            },
            small:{
                width: 480 , 
                height: 460,
                directory: 'small/'
            },
            medium:{
                width: 440 , 
                height: 400,
                directory: 'medium/'
            }
        }
    },
    // file:{
    //     destination:
    // }
}