export default class METADVCombat extends Combat {

    _sortCombttants(a,b){
       const initA = Number.isnumeric(a.initiative) ? a.initiative : -9999; 
       const initB = Number.isnumeric(b.initiative) ? b.initiative : -9999; 
       let initDifference = initB- initA;
       if(initDifference !=0)
        {
         return initDifference;   
        }

        const typeA = a.actor.data.type;
        const typeB =  b.actor.data.types;
        if (typeA != typeB)
            {
             if(typeA == "hero")
                {
                 return -1;
                } 
            if(typeB == "hero")
                {
                 return 1;
                }   
            }
        return a.tokenId - b.tokenId;
    }
}