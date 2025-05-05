export const getToken=()=>{
    try{
        const token=localStorage.getItem('authToken');
        return token || null;

    }
    catch(error){
        console.error("Error:",error);
        return null;
    }
} ;

export const getRequester=()=>{
    try{
        const requester=localStorage.getItem('requester');
        return requester || null;
    }
    catch(error){
        console.error("Error:",error);
        return null;
    }
};

export const clearUserSession=()=>{
    try{
        localStorage.clear();
    }
    catch(error){
        console.error("Error:",error);
    }
};
