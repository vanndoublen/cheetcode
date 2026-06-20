import "dotenv/config";
import prisma from "@/lib/db";
import { Language } from "@/generated/prisma/enums";

type Config = {
  language: Language;
  judge0Id: number;
  prompt: string;
  driver: string;
};

const CONFIGS: Config[] = [
  // ============================================================
  // PYTHON3
  // ============================================================
  {
    language: Language.PYTHON3,
    judge0Id: 71,
    prompt: `from __future__ import annotations
import sys
import json
import random
import functools
import collections
import string
import math
import datetime
from typing import *
from functools import *
from collections import *
from itertools import *
from heapq import *
from bisect import *
from string import *
from operator import *
from math import *

inf = float('inf')

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def list_node(values):
    if not values:
        return None
    head = ListNode(values[0])
    p = head
    for v in values[1:]:
        p.next = ListNode(v)
        p = p.next
    return head

def list_node_to_array(head):
    r = []
    while head:
        r.append(head.val)
        head = head.next
    return r

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def tree_node(values):
    if not values:
        return None
    root = TreeNode(values[0])
    q = collections.deque([root])
    i = 1
    while q and i < len(values):
        node = q.popleft()
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i])
            q.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            q.append(node.right)
        i += 1
    return root

def tree_node_to_array(root):
    if not root:
        return []
    r = []
    q = collections.deque([root])
    while q:
        n = q.popleft()
        if n:
            r.append(n.val)
            q.append(n.left)
            q.append(n.right)
        else:
            r.append(None)
    while r and r[-1] is None:
        r.pop()
    return r`,
    driver: `# --- driver ---
_input_sig = "{{INPUT_SIG}}".split(",") if "{{INPUT_SIG}}" else []
_data = sys.stdin.read().splitlines()
_args = []
for i, line in enumerate(_data):
    if not line.strip():
        continue
    t = _input_sig[i] if i < len(_input_sig) else ""
    val = eval(line)
    if t in ("ListNode", "ListNode?"):
        val = list_node(val) if val is not None else None
    elif t in ("TreeNode", "TreeNode?"):
        val = tree_node(val) if val is not None else None
    _args.append(val)

_result = Solution().{{ENTRY_POINT}}(*_args)

_out_sig = "{{OUTPUT_SIG}}"
if _out_sig in ("ListNode", "ListNode?"):
    _result = list_node_to_array(_result)
elif _out_sig in ("TreeNode", "TreeNode?"):
    _result = tree_node_to_array(_result)

print(_result)`,
  },

  // ============================================================
  // PYTHON (2.x — aliased to Python3 for consistency)
  // ============================================================
  {
    language: Language.PYTHON,
    judge0Id: 71, // intentionally use Python 3 interpreter
    prompt: `# Note: This runs under Python 3 for compatibility.
from __future__ import annotations
import sys
import collections
from typing import *

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def list_node(values):
    if not values: return None
    head = ListNode(values[0]); p = head
    for v in values[1:]:
        p.next = ListNode(v); p = p.next
    return head

def list_node_to_array(head):
    r = []
    while head: r.append(head.val); head = head.next
    return r

def tree_node(values):
    if not values: return None
    root = TreeNode(values[0])
    q = collections.deque([root]); i = 1
    while q and i < len(values):
        n = q.popleft()
        if i < len(values) and values[i] is not None:
            n.left = TreeNode(values[i]); q.append(n.left)
        i += 1
        if i < len(values) and values[i] is not None:
            n.right = TreeNode(values[i]); q.append(n.right)
        i += 1
    return root

def tree_node_to_array(root):
    if not root: return []
    r = []; q = collections.deque([root])
    while q:
        n = q.popleft()
        if n: r.append(n.val); q.append(n.left); q.append(n.right)
        else: r.append(None)
    while r and r[-1] is None: r.pop()
    return r`,
    driver: `# --- driver ---
_input_sig = "{{INPUT_SIG}}".split(",") if "{{INPUT_SIG}}" else []
_data = sys.stdin.read().splitlines()
_args = []
for i, line in enumerate(_data):
    if not line.strip(): continue
    t = _input_sig[i] if i < len(_input_sig) else ""
    val = eval(line)
    if t in ("ListNode", "ListNode?"): val = list_node(val) if val is not None else None
    elif t in ("TreeNode", "TreeNode?"): val = tree_node(val) if val is not None else None
    _args.append(val)

_result = Solution().{{ENTRY_POINT}}(*_args)

_out_sig = "{{OUTPUT_SIG}}"
if _out_sig in ("ListNode", "ListNode?"): _result = list_node_to_array(_result)
elif _out_sig in ("TreeNode", "TreeNode?"): _result = tree_node_to_array(_result)

print(_result)`,
  },

  // ============================================================
  // JAVASCRIPT
  // ============================================================
  {
    language: Language.JAVASCRIPT,
    judge0Id: 63,
    prompt: `function ListNode(val, next) {
  this.val = (val === undefined ? 0 : val);
  this.next = (next === undefined ? null : next);
}

function arrayToListNode(arr) {
  if (!arr || arr.length === 0) return null;
  const head = new ListNode(arr[0]);
  let p = head;
  for (let i = 1; i < arr.length; i++) { p.next = new ListNode(arr[i]); p = p.next; }
  return head;
}

function listNodeToArray(head) {
  const r = [];
  while (head) { r.push(head.val); head = head.next; }
  return r;
}

function TreeNode(val, left, right) {
  this.val = (val === undefined ? 0 : val);
  this.left = (left === undefined ? null : left);
  this.right = (right === undefined ? null : right);
}

function arrayToTreeNode(arr) {
  if (!arr || arr.length === 0) return null;
  const root = new TreeNode(arr[0]);
  const q = [root];
  let i = 1;
  while (q.length && i < arr.length) {
    const n = q.shift();
    if (i < arr.length && arr[i] !== null) { n.left = new TreeNode(arr[i]); q.push(n.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { n.right = new TreeNode(arr[i]); q.push(n.right); }
    i++;
  }
  return root;
}

function treeNodeToArray(root) {
  if (!root) return [];
  const r = [], q = [root];
  while (q.length) {
    const n = q.shift();
    if (n) { r.push(n.val); q.push(n.left); q.push(n.right); }
    else r.push(null);
  }
  while (r.length && r[r.length - 1] === null) r.pop();
  return r;
}

function pyPrint(v) {
  if (v === null || v === undefined) return "None";
  if (v === true) return "True";
  if (v === false) return "False";
  if (Array.isArray(v)) return "[" + v.map(pyPrint).join(", ") + "]";
  if (typeof v === "string") return "'" + v + "'";
  return String(v);
}`,
    driver: `// --- driver ---
const _inputSig = "{{INPUT_SIG}}" ? "{{INPUT_SIG}}".split(",") : [];
const _stdin = require("fs").readFileSync(0, "utf8").trim().split("\\n");
const _args = _stdin.map((line, i) => {
  let val = JSON.parse(line.replace(/'/g, '"').replace(/None/g, "null").replace(/True/g, "true").replace(/False/g, "false"));
  const t = _inputSig[i] || "";
  if (t === "ListNode" || t === "ListNode?") val = val === null ? null : arrayToListNode(val);
  else if (t === "TreeNode" || t === "TreeNode?") val = val === null ? null : arrayToTreeNode(val);
  return val;
});

let _result = {{ENTRY_POINT}}(..._args);

const _outSig = "{{OUTPUT_SIG}}";
if (_outSig === "ListNode" || _outSig === "ListNode?") _result = listNodeToArray(_result);
else if (_outSig === "TreeNode" || _outSig === "TreeNode?") _result = treeNodeToArray(_result);

console.log(typeof _result === "string" ? _result : pyPrint(_result));`,
  },

  // ============================================================
  // TYPESCRIPT
  // ============================================================
  {
    language: Language.TYPESCRIPT,
    judge0Id: 74,
    prompt: `declare const require: any;
interface MapConstructor { new <K, V>(): any; }
declare const Map: MapConstructor;
interface SetConstructor { new <T>(): any; }
declare const Set: SetConstructor;
declare const Promise: any;
declare const Symbol: any;

class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

function arrayToListNode(arr: number[]): ListNode | null {
  if (!arr || arr.length === 0) return null;
  const head = new ListNode(arr[0]);
  let p = head;
  for (let i = 1; i < arr.length; i++) { p.next = new ListNode(arr[i]); p = p.next; }
  return head;
}

function listNodeToArray(head: ListNode | null): number[] {
  const r: number[] = [];
  while (head) { r.push(head.val); head = head.next; }
  return r;
}

class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
  }
}

function arrayToTreeNode(arr: (number | null)[]): TreeNode | null {
  if (!arr || arr.length === 0) return null;
  const root = new TreeNode(arr[0] as number);
  const q: TreeNode[] = [root];
  let i = 1;
  while (q.length && i < arr.length) {
    const n = q.shift()!;
    if (i < arr.length && arr[i] !== null) { n.left = new TreeNode(arr[i] as number); q.push(n.left); }
    i++;
    if (i < arr.length && arr[i] !== null) { n.right = new TreeNode(arr[i] as number); q.push(n.right); }
    i++;
  }
  return root;
}

function treeNodeToArray(root: TreeNode | null): (number | null)[] {
  if (!root) return [];
  const r: (number | null)[] = [];
  const q: (TreeNode | null)[] = [root];
  while (q.length) {
    const n = q.shift();
    if (n) { r.push(n.val); q.push(n.left); q.push(n.right); }
    else r.push(null);
  }
  while (r.length && r[r.length - 1] === null) r.pop();
  return r;
}

function pyPrint(v: any): string {
  if (v === null || v === undefined) return "None";
  if (v === true) return "True";
  if (v === false) return "False";
  if (Array.isArray(v)) return "[" + v.map(pyPrint).join(", ") + "]";
  if (typeof v === "string") return "'" + v + "'";
  return String(v);
}`,
    driver: `// --- driver ---
const _inputSig: string[] = "{{INPUT_SIG}}" ? "{{INPUT_SIG}}".split(",") : [];
const _stdin: string[] = require("fs").readFileSync(0, "utf8").trim().split("\\n");
const _args = _stdin.map((line: string, i: number) => {
  let val: any = JSON.parse(line.replace(/'/g, '"').replace(/None/g, "null").replace(/True/g, "true").replace(/False/g, "false"));
  const t: any = _inputSig[i] || "";
  if (t === "ListNode" || t === "ListNode?") val = val === null ? null : arrayToListNode(val);
  else if (t === "TreeNode" || t === "TreeNode?") val = val === null ? null : arrayToTreeNode(val);
  return val;
});

let _result: any = ({{ENTRY_POINT}} as any)(..._args);

const _outSig: any = "{{OUTPUT_SIG}}";
if (_outSig === "ListNode" || _outSig === "ListNode?") _result = listNodeToArray(_result);
else if (_outSig === "TreeNode" || _outSig === "TreeNode?") _result = treeNodeToArray(_result);

console.log(typeof _result === "string" ? _result : pyPrint(_result));`,
  },

  // ============================================================
  // JAVA
  // ============================================================
  {
    language: Language.JAVA,
    judge0Id: 62,
    prompt: `import java.util.*;
import java.io.*;
import java.lang.reflect.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val; this.left = left; this.right = right;
    }
}

class Helpers {
    static ListNode arrayToListNode(int[] arr) {
        if (arr == null || arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode p = head;
        for (int i = 1; i < arr.length; i++) { p.next = new ListNode(arr[i]); p = p.next; }
        return head;
    }

    static List<Integer> listNodeToList(ListNode head) {
        List<Integer> r = new ArrayList<>();
        while (head != null) { r.add(head.val); head = head.next; }
        return r;
    }

    static String pyStr(Object val) {
        if (val == null) return "None";
        if (val instanceof Boolean) return ((Boolean) val) ? "True" : "False";
        if (val instanceof String) return "'" + val + "'";
        if (val instanceof int[]) {
            int[] a = (int[]) val;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(", "); sb.append(a[i]); }
            return sb.append("]").toString();
        }
        if (val instanceof int[][]) {
            int[][] a = (int[][]) val;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(", "); sb.append(pyStr(a[i])); }
            return sb.append("]").toString();
        }
        if (val instanceof List) {
            List<?> list = (List<?>) val;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) { if (i > 0) sb.append(", "); sb.append(pyStr(list.get(i))); }
            return sb.append("]").toString();
        }
        return val.toString();
    }

    static Object parse(String s, String type) {
        s = s.trim();
        if (s.equals("null") || s.equals("None")) return null;
        if (type.equals("int")) return Integer.parseInt(s);
        if (type.equals("long")) return Long.parseLong(s);
        if (type.equals("double")) return Double.parseDouble(s);
        if (type.equals("bool")) return s.equals("true") || s.equals("True");
        if (type.equals("string")) return s.replaceAll("^[\\"']|[\\"']$", "");
        if (type.equals("int[]")) {
            s = s.substring(1, s.length() - 1).trim();
            if (s.isEmpty()) return new int[0];
            String[] parts = s.split(",");
            int[] r = new int[parts.length];
            for (int i = 0; i < parts.length; i++) r[i] = Integer.parseInt(parts[i].trim());
            return r;
        }
        if (type.equals("ListNode") || type.equals("ListNode?")) {
            int[] arr = (int[]) parse(s, "int[]");
            return arrayToListNode(arr);
        }
        return s;
    }
}`,
    driver: `// --- driver ---
public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        List<String> lines = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) if (!line.trim().isEmpty()) lines.add(line);

        String sigStr = "{{INPUT_SIG}}";
        String[] sig = sigStr.isEmpty() ? new String[0] : sigStr.split(",");

        Object[] parsedArgs = new Object[lines.size()];
        for (int i = 0; i < lines.size(); i++) {
            String t = i < sig.length ? sig[i].trim() : "";
            parsedArgs[i] = Helpers.parse(lines.get(i), t);
        }

        Solution sol = new Solution();
        Method method = null;
        for (Method m : Solution.class.getDeclaredMethods()) {
            if (m.getName().equals("{{ENTRY_POINT}}")) { method = m; break; }
        }
        Object result = method.invoke(sol, parsedArgs);

        String outSig = "{{OUTPUT_SIG}}";
        if (outSig.equals("ListNode") || outSig.equals("ListNode?")) {
            result = Helpers.listNodeToList((ListNode) result);
        }

        System.out.println(result instanceof String ? (String) result : Helpers.pyStr(result));
    }
}`,
  },

  // ============================================================
  // CSHARP
  // ============================================================
  {
    language: Language.CSHARP,
    judge0Id: 51,
    prompt: `using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;

public class ListNode {
    public int val;
    public ListNode next;
    public ListNode(int val = 0, ListNode next = null) { this.val = val; this.next = next; }
}

public class TreeNode {
    public int val;
    public TreeNode left;
    public TreeNode right;
    public TreeNode(int val = 0, TreeNode left = null, TreeNode right = null) {
        this.val = val; this.left = left; this.right = right;
    }
}

public static class Helpers {
    public static ListNode ArrayToListNode(int[] arr) {
        if (arr == null || arr.Length == 0) return null;
        var head = new ListNode(arr[0]);
        var p = head;
        for (int i = 1; i < arr.Length; i++) { p.next = new ListNode(arr[i]); p = p.next; }
        return head;
    }

    public static List<int> ListNodeToList(ListNode head) {
        var r = new List<int>();
        while (head != null) { r.Add(head.val); head = head.next; }
        return r;
    }

    public static string PyStr(object val) {
        if (val == null) return "None";
        if (val is bool b) return b ? "True" : "False";
        if (val is string s) return "'" + s + "'";
        if (val is IEnumerable e && !(val is string)) {
            var parts = new List<string>();
            foreach (var x in e) parts.Add(PyStr(x));
            return "[" + string.Join(", ", parts) + "]";
        }
        return val.ToString();
    }

    public static object Parse(string s, string type) {
        s = s.Trim();
        if (s == "null" || s == "None") return null;
        if (type == "int") return int.Parse(s);
        if (type == "long") return long.Parse(s);
        if (type == "double") return double.Parse(s);
        if (type == "bool") return s == "true" || s == "True";
        if (type == "string") return s.Trim('"', '\\'');
        if (type == "int[]") {
            s = s.Trim('[', ']');
            if (s.Length == 0) return new int[0];
            return s.Split(',').Select(x => int.Parse(x.Trim())).ToArray();
        }
        if (type == "ListNode" || type == "ListNode?") return ArrayToListNode((int[])Parse(s, "int[]"));
        return s;
    }
}`,
    driver: `// --- driver ---
public class Program {
    public static void Main() {
        var lines = new List<string>();
        string line;
        while ((line = Console.ReadLine()) != null) if (!string.IsNullOrWhiteSpace(line)) lines.Add(line);

        var sigStr = "{{INPUT_SIG}}";
        var sig = string.IsNullOrEmpty(sigStr) ? new string[0] : sigStr.Split(',');

        var parsedArgs = new object[lines.Count];
        for (int i = 0; i < lines.Count; i++) {
            var t = i < sig.Length ? sig[i].Trim() : "";
            parsedArgs[i] = Helpers.Parse(lines[i], t);
        }

        var sol = new Solution();
        var method = typeof(Solution).GetMethods().FirstOrDefault(m =>
            m.Name.Equals("{{ENTRY_POINT}}", StringComparison.OrdinalIgnoreCase)
        );
        var result = method.Invoke(sol, parsedArgs);

        var outSig = "{{OUTPUT_SIG}}";
        if (outSig == "ListNode" || outSig == "ListNode?") result = Helpers.ListNodeToList((ListNode)result);

        Console.WriteLine(result is string s2 ? s2 : Helpers.PyStr(result));
    }
}`,
  },

  // ============================================================
  // CPP — starter, per-signature driverOverride needed for many problems
  // ============================================================
  {
    language: Language.CPP,
    judge0Id: 54,
    prompt: `#include <bits/stdc++.h>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *l, TreeNode *r) : val(x), left(l), right(r) {}
};

ListNode* arrayToListNode(const vector<int>& arr) {
    if (arr.empty()) return nullptr;
    ListNode* head = new ListNode(arr[0]);
    ListNode* p = head;
    for (size_t i = 1; i < arr.size(); i++) { p->next = new ListNode(arr[i]); p = p->next; }
    return head;
}

vector<int> listNodeToArray(ListNode* head) {
    vector<int> r;
    while (head) { r.push_back(head->val); head = head->next; }
    return r;
}

string pyStr(int v) { return to_string(v); }
string pyStr(long long v) { return to_string(v); }
string pyStr(double v) { ostringstream o; o << v; return o.str(); }
string pyStr(bool v) { return v ? "True" : "False"; }
string pyStr(const string& v) { return "'" + v + "'"; }
template<typename T> string pyStr(const vector<T>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) s += ", "; s += pyStr(v[i]); }
    return s + "]";
}

static vector<int> parseIntArray(const string& s) {
    vector<int> r;
    string cur;
    for (char c : s) {
        if (c == '[' || c == ' ') continue;
        if (c == ',' || c == ']') { if (!cur.empty()) { r.push_back(stoi(cur)); cur.clear(); } }
        else cur += c;
    }
    return r;
}`,
    driver: `// --- driver ---
// NOTE: C++ has no reflection. This is a placeholder for (int[],int) -> int[] shape.
// For other signatures, provide CodeSnippet.driverOverride.
int main() {
    ios::sync_with_stdio(false);
    vector<string> lines;
    string line;
    while (getline(cin, line)) if (!line.empty()) lines.push_back(line);

    vector<int> nums = parseIntArray(lines[0]);
    int target = stoi(lines[1]);
    Solution sol;
    auto result = sol.{{ENTRY_POINT}}(nums, target);
    cout << pyStr(result) << endl;
    return 0;
}`,
  },

  // ============================================================
  // C — starter, per-signature driverOverride needed for most problems
  // ============================================================
  {
    language: Language.C,
    judge0Id: 50,
    prompt: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

struct ListNode {
    int val;
    struct ListNode *next;
};

struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};

// ----- helpers -----
struct ListNode* arrayToListNode(int* arr, int size) {
    if (size == 0) return NULL;
    struct ListNode* head = malloc(sizeof(struct ListNode));
    head->val = arr[0];
    head->next = NULL;
    struct ListNode* p = head;
    for (int i = 1; i < size; i++) {
        p->next = malloc(sizeof(struct ListNode));
        p->next->val = arr[i];
        p->next->next = NULL;
        p = p->next;
    }
    return head;
}

// reads chars from stdin until newline, returns line in static buffer
static char _line_buf[1 << 20];
static char* read_line() {
    if (!fgets(_line_buf, sizeof(_line_buf), stdin)) return NULL;
    int len = strlen(_line_buf);
    if (len > 0 && _line_buf[len-1] == '\\n') _line_buf[len-1] = '\\0';
    return _line_buf;
}

// parse "[1,2,3]" style int array from a line
static int* parse_int_array(const char* s, int* size) {
    *size = 0;
    int* arr = malloc(sizeof(int) * 100000);
    const char* p = s;
    while (*p) {
        if (*p == '-' || (*p >= '0' && *p <= '9')) {
            char* end;
            arr[(*size)++] = (int)strtol(p, &end, 10);
            p = end;
        } else p++;
    }
    return arr;
}

// parse a single int from a line
static int parse_int(const char* s) {
    return (int)strtol(s, NULL, 10);
}

// parse a quoted string from a line, returns malloc'd string
static char* parse_string(const char* s) {
    while (*s == ' ' || *s == '"' || *s == '\\'') s++;
    int len = strlen(s);
    while (len > 0 && (s[len-1] == '"' || s[len-1] == '\\'' || s[len-1] == ' ')) len--;
    char* out = malloc(len + 1);
    memcpy(out, s, len);
    out[len] = '\\0';
    return out;
}

// printers — Python-style
static void print_int_array(int* arr, int size) {
    printf("[");
    for (int i = 0; i < size; i++) {
        if (i > 0) printf(", ");
        printf("%d", arr[i]);
    }
    printf("]");
}

static void print_int(int v) { printf("%d", v); }
static void print_bool(bool v) { printf("%s", v ? "True" : "False"); }
static void print_string(const char* s) { printf("'%s'", s); }`,

    driver: `// driver overridden per-signature in submit mutation`,
  },

  // ============================================================
  // RUST — limited support, per-signature driverOverride needed
  // ============================================================
  {
    language: Language.RUST,
    judge0Id: 73,
    prompt: `use std::io::{self, Read};

pub struct Solution;

#[derive(Debug, PartialEq, Eq)]
pub struct ListNode {
    pub val: i32,
    pub next: Option<Box<ListNode>>,
}
impl ListNode {
    pub fn new(val: i32) -> Self { ListNode { val, next: None } }
}

fn array_to_list_node(arr: Vec<i32>) -> Option<Box<ListNode>> {
    let mut head: Option<Box<ListNode>> = None;
    for v in arr.into_iter().rev() {
        let mut node = Box::new(ListNode::new(v));
        node.next = head;
        head = Some(node);
    }
    head
}

fn list_node_to_vec(mut head: Option<Box<ListNode>>) -> Vec<i32> {
    let mut r = vec![];
    while let Some(node) = head { r.push(node.val); head = node.next; }
    r
}

// Simple parser for "[1,2,3]" style int arrays
fn parse_int_array(s: &str) -> Vec<i32> {
    s.trim().trim_start_matches('[').trim_end_matches(']')
        .split(',').filter(|p| !p.trim().is_empty())
        .map(|p| p.trim().parse().unwrap()).collect()
}`,
    driver: `// --- driver ---
// NOTE: Rust is harder to support generically. This covers (int[], int) -> int[] shape.
// For other signatures, provide CodeSnippet.driverOverride.
fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let lines: Vec<&str> = input.lines().filter(|l| !l.trim().is_empty()).collect();

    let nums: Vec<i32> = parse_int_array(lines[0]);
    let target: i32 = lines[1].trim().parse().unwrap();

    let result = Solution::{{ENTRY_POINT}}(nums, target);
    // Python-style output for Vec<i32>
    let parts: Vec<String> = result.iter().map(|x| x.to_string()).collect();
    println!("[{}]", parts.join(", "));
}`,
  },
];

async function main() {
  console.log(`Seeding ${CONFIGS.length} language configs...`);
  for (const cfg of CONFIGS) {
    await prisma.languageConfig.upsert({
      where: { language: cfg.language },
      update: {
        prompt: cfg.prompt,
        driver: cfg.driver,
        judge0Id: cfg.judge0Id,
      },
      create: cfg,
    });
    console.log(`  ✓ ${cfg.language} (judge0Id: ${cfg.judge0Id})`);
  }
  console.log("Done!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
