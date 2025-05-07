import callsites from 'callsites';

/**
 * @purpose  utility function meant to allow stack look up at a given index
 * @param { Number } at - the index from of with to return the stack info
 * @return  String | String[] | null 
 * 
 * @note  
 *  - at 2: bring back where the lookUpInStack function is called
 *
 * In Synchonous func : `
 *  - at 3: where it's parent is called
 * 
 * In Async func
 * - at 8: where it's parent is called
*/
export function lockUpInStack(at?: number): Array<string> | string | null {
    let anchor: any = Error().stack?.split("\n").map(str => str.trim());
    
    if(!at){
        return anchor
    }

    if(at && typeof at != "number"){
        console.warn("invalid argument passed to lockUpInStack, expecting a number");
        return null;
    }

    if(!anchor[at]){
        console.warn("invalid `at` index passed to lockUpInStack")
        return null;
    }

    return anchor[at];
}


export function getCallerInfo() {
  const stack = callsites();
  // Index 0 is this function, index 1 is the caller
  const caller = stack[3];
  return {
    fileName: caller.getFileName(),
    lineNumber: caller.getLineNumber(),
    columnNumber: caller.getColumnNumber(),
    functionName: caller.getFunctionName(),
  };
}

