/**
 * Generic C++ driver generator.
 *
 * C++ has no reflection, so instead of one hand-written driver per signature we
 * emit a `main()` from the problem's input/output signatures, backed by a
 * templated parser (`_pv`) and the prompt's `pyStr` printers. Covers scalars
 * (int, long, double, bool, string), arbitrarily-nested vectors, and ListNode.
 *
 * Returns null when a signature uses an unsupported type (e.g. TreeNode) — the
 * caller then treats C++ as unavailable for that problem (UI gating).
 */

const SCALAR: Record<string, string> = {
  int: "int",
  long: "long long",
  double: "double",
  bool: "bool",
  string: "string",
};

/** Map a language-agnostic type token to a C++ type, or null if unsupported. */
export function cppType(token: string): string | null {
  let base = token.trim().replace(/\?$/, ""); // strip nullable marker
  if (base === "ListNode") return "ListNode*";
  let depth = 0;
  while (base.endsWith("[]")) {
    depth++;
    base = base.slice(0, -2);
  }
  const scalar = SCALAR[base];
  if (!scalar) return null;
  let t = scalar;
  for (let i = 0; i < depth; i++) t = `vector<${t}>`;
  return t;
}

const PRELUDE = `// --- generic driver prelude ---
struct _Parser {
  const string& s; size_t i;
  _Parser(const string& str): s(str), i(0) {}
  void ws(){ while(i<s.size() && (s[i]==' '||s[i]=='\\t')) i++; }
  char peek(){ ws(); return i<s.size()? s[i] : '\\0'; }
};
static void _pv(_Parser& p, long long& out){ p.ws(); size_t j=p.i; if(p.i<p.s.size()&&(p.s[p.i]=='-'||p.s[p.i]=='+'))p.i++; while(p.i<p.s.size()&&isdigit((unsigned char)p.s[p.i]))p.i++; out=stoll(p.s.substr(j,p.i-j)); }
static void _pv(_Parser& p, int& out){ long long v; _pv(p,v); out=(int)v; }
static void _pv(_Parser& p, double& out){ p.ws(); size_t j=p.i; while(p.i<p.s.size()){ char c=p.s[p.i]; if(isdigit((unsigned char)c)||c=='-'||c=='+'||c=='.'||c=='e'||c=='E') p.i++; else break; } out=stod(p.s.substr(j,p.i-j)); }
static void _pv(_Parser& p, bool& out){ p.ws(); if(p.s.compare(p.i,4,"true")==0||p.s.compare(p.i,4,"True")==0){out=true;p.i+=4;} else if(p.s.compare(p.i,5,"false")==0||p.s.compare(p.i,5,"False")==0){out=false;p.i+=5;} else {out=false;} }
static void _pv(_Parser& p, string& out){ p.ws(); if(p.i<p.s.size()&&(p.s[p.i]=='\\''||p.s[p.i]=='"')){ char q=p.s[p.i++]; size_t j=p.i; while(p.i<p.s.size()&&p.s[p.i]!=q)p.i++; out=p.s.substr(j,p.i-j); if(p.i<p.s.size())p.i++; } else { size_t j=p.i; while(p.i<p.s.size()&&p.s[p.i]!=','&&p.s[p.i]!=']')p.i++; out=p.s.substr(j,p.i-j); } }
template<typename T> static void _pv(_Parser& p, vector<T>& out){ if(p.peek()=='[')p.i++; for(;;){ char c=p.peek(); if(c==']'){p.i++;break;} if(c=='\\0')break; T el; _pv(p,el); out.push_back(el); if(p.peek()==',')p.i++; } }
template<typename T> static T _parse(const string& line){ _Parser p(line); T v=T(); _pv(p,v); return v; }`;

/**
 * Build the full C++ driver for a problem, or null if the signature isn't
 * supported.
 */
export function buildCppDriver(
  inputSig: string,
  outputSig: string,
  entryPoint: string,
): string | null {
  const inTokens = inputSig ? inputSig.split(",").map((s) => s.trim()) : [];
  const outToken = outputSig.trim();

  // Resolve argument types.
  const args: { decl: string; name: string }[] = [];
  for (let i = 0; i < inTokens.length; i++) {
    const tok = inTokens[i];
    const name = `_a${i}`;
    if (tok === "ListNode" || tok === "ListNode?") {
      args.push({
        decl: `  ListNode* ${name} = arrayToListNode(_parse<vector<int>>(_lines[${i}]));`,
        name,
      });
      continue;
    }
    const t = cppType(tok);
    if (!t) return null;
    args.push({
      decl: `  ${t} ${name} = _parse<${t}>(_lines[${i}]);`,
      name,
    });
  }

  // Resolve output print statement.
  let printStmt: string;
  if (outToken === "void") {
    return null;
  } else if (outToken === "ListNode" || outToken === "ListNode?") {
    printStmt = `  cout << pyStr(listNodeToArray(_res)) << "\\n";`;
  } else if (outToken === "double") {
    // High precision so float-tolerant comparison matches Python's repr.
    printStmt = `  cout << setprecision(15) << _res << "\\n";`;
  } else {
    const t = cppType(outToken);
    if (!t) return null;
    printStmt = `  cout << pyStr(_res) << "\\n";`;
  }

  return `${PRELUDE}

// --- driver ---
int main(){
  ios::sync_with_stdio(false);
  vector<string> _lines; string _l;
  while(getline(cin,_l)){ if(!_l.empty()) _lines.push_back(_l); }
  Solution _sol;
${args.map((a) => a.decl).join("\n")}
  auto _res = _sol.${entryPoint}(${args.map((a) => a.name).join(", ")});
${printStmt}
  return 0;
}`;
}
