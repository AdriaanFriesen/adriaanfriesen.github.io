mergeInto(LibraryManager.library, {
    highlightsquare: function(x, y) {
        if (0 <= x && x <= 7 &&  0 <= y && y <= 7) {
            let square = document.getElementById(x + "-" + y);
            if (square.classList.contains("white")) {
                square.classList.remove("white");
                square.classList.add("highlight-white");
            }
            
            else if (square.classList.contains("blue")) {
                square.classList.remove("blue");
                square.classList.add("highlight-blue");
            }
    
            else if (square.classList.contains("pink")) {
                square.classList.remove("pink");
                square.classList.add("highlight-pink");
            }
        }
    },
    clearhighlight: function() {
        for (let y = 0; y <= 7; y++) {
            for (let x = 0; x <= 7; x++) {
                let square = document.getElementById(x + "-" + y);
                if (square.classList.contains("highlight-white")) {
                    square.classList.remove("highlight-white");
                    square.classList.add("white");
                }
                
                else if (square.classList.contains("highlight-blue")) {
                    square.classList.remove("highlight-blue");
                    square.classList.add("blue");
                }

                else if (square.classList.contains("highlight-pink")) {
                    square.classList.remove("highlight-pink");
                    square.classList.add("pink");
                }
            }
        }
    }
});