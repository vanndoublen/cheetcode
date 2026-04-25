// C drivers per signature. Key is `${inputSignature}->${outputSignature}`.
// {{ENTRY_POINT}} placeholder gets replaced at submit time.

export const C_DRIVERS: Record<string, string> = {
  "int[],int->int[]": `
int main() {
    char line[1 << 20];
    fgets(line, sizeof(line), stdin);
    int nums[100000], numsSize = 0;
    char* p = line;
    while (*p) {
        if (*p == '-' || (*p >= '0' && *p <= '9')) {
            char* end;
            nums[numsSize++] = (int)strtol(p, &end, 10);
            p = end;
        } else p++;
    }
    fgets(line, sizeof(line), stdin);
    int target = atoi(line);
    int returnSize;
    int* result = {{ENTRY_POINT}}(nums, numsSize, target, &returnSize);
    printf("[");
    for (int i = 0; i < returnSize; i++) { if (i > 0) printf(", "); printf("%d", result[i]); }
    printf("]\\n");
    return 0;
}`,

  "int[]->int": `
int main() {
    char line[1 << 20];
    fgets(line, sizeof(line), stdin);
    int nums[100000], numsSize = 0;
    char* p = line;
    while (*p) {
        if (*p == '-' || (*p >= '0' && *p <= '9')) {
            char* end;
            nums[numsSize++] = (int)strtol(p, &end, 10);
            p = end;
        } else p++;
    }
    int result = {{ENTRY_POINT}}(nums, numsSize);
    printf("%d\\n", result);
    return 0;
}`,

  "int[]->int[]": `
int main() {
    char line[1 << 20];
    fgets(line, sizeof(line), stdin);
    int nums[100000], numsSize = 0;
    char* p = line;
    while (*p) {
        if (*p == '-' || (*p >= '0' && *p <= '9')) {
            char* end;
            nums[numsSize++] = (int)strtol(p, &end, 10);
            p = end;
        } else p++;
    }
    int returnSize;
    int* result = {{ENTRY_POINT}}(nums, numsSize, &returnSize);
    printf("[");
    for (int i = 0; i < returnSize; i++) { if (i > 0) printf(", "); printf("%d", result[i]); }
    printf("]\\n");
    return 0;
}`,

  "int->int": `
int main() {
    char line[256];
    fgets(line, sizeof(line), stdin);
    int n = atoi(line);
    int result = {{ENTRY_POINT}}(n);
    printf("%d\\n", result);
    return 0;
}`,

  "string->bool": `
static char* trim_quotes(char* s) {
    int len = strlen(s);
    if (len > 0 && s[len-1] == '\\n') { s[len-1] = '\\0'; len--; }
    if (len > 0 && (s[len-1] == '"' || s[len-1] == '\\'')) { s[len-1] = '\\0'; len--; }
    if (s[0] == '"' || s[0] == '\\'') s++;
    return s;
}
int main() {
    char line[1 << 16];
    fgets(line, sizeof(line), stdin);
    char* s = trim_quotes(line);
    bool result = {{ENTRY_POINT}}(s);
    printf("%s\\n", result ? "True" : "False");
    return 0;
}`,
};

export function getCDriver(inputSig: string, outputSig: string): string | null {
  const key = `${inputSig}->${outputSig}`;
  return C_DRIVERS[key] ?? null;
}