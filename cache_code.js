var cache_codes = {
    "C#":`using System;

    public class Test
    {
        public static void Main()
        {
            // your code goes here
            
        }
    }
    `,
    "C":`#include <stdio.h>

    int main(void) {
        // your code goes here
        return 0;
    }
    
    `,
    "C++": `#include <iostream>
    using namespace std;
    
    int main() {
        // your code goes here
        return 0;
    }
    `,
    "Go" : `package main
    import "fmt"
    
    func main(){
        // your code goes here
    }
    `,
    "Python" : `## your code goes here` ,
    "Ruby" : `## your code goes here` ,
    "JavaScript" : `// your code goes here`,
    "Bash" : `/* cook your code below */   `,
    "Clojure" : `; your code goes here `,

}

module.exports =cache_codes;