const fs = require('fs');

const path = 'c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/app/(workspace)/planner/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `                  )}
                </motion.button>
              </div>
            </div>
        </div>
  
  {/* CAREER HUB & INTELLIGENCE MODULES */}`;

const replacementStr = `                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  
  {/* CAREER HUB & INTELLIGENCE MODULES */}`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync(path, code);
console.log("JSX fixed");
