


export const validateOptions = (page, limit) =>{
            if(!page){
                page=1
            }
            if(!limit){
                limit=10
            }
            return {
                validatePage:Number(page),
                validateLimit:Number(limit)
            }
};