import ArrayList from "../src/Arrays/ArrayList";
import TreeMap from "../src/Trees/TreeMap";
import TreeSet from "../src/Trees/TreeSet";

/**
 * From NFA to DFA:
 * 
 * Given a nondeterministic finite automaton (NFA) we can construct a DFA in two main steps:
 * 
 * (1) Construct a DFA each of whose states is composite, namely a set of NFA states. 
 * This is done by methods CompositeDfaTransition and EpsilonClose
 * 
 * (2) Replace each composite state (a TreeSet<number>) by a simple state (a number). This is done by method
 * MkRenamer, which creates a renamer, and method Rename, which applies the renamer to the composite-state
 * DFA created in step 1. 
 */

/**
 * A transition in the NFA.
 * A transition has a label which is a string or null. If null label then we have an epsilon transition.
 * It also has a target state which is a number.
 */
class Transition {
    private readonly label: string | null;
    private readonly target: number;

    constructor(label: string | null, target: number) {
        this.label = label;
        this.target = target;
    }

    getLabel(): string | null {
        return this.label;
    }

    getTarget(): number {
        return this.target;
    }

    toString(): string {
        return `-${this.label}->${this.target}`;
    }
}

/**
 * Nested class for creating distinctly named states when constructing NFAs
 */
class NameSource {
    private static _nextName: number = 0;

    next(): number {
        return NameSource._nextName++;
    }
}

/**
 * Nondeterministic finite automaton (NFA) is represented as a mapping between the state number (int) to an
 * ArrayList of transitions.
 */
class NFA {
    transitions: TreeMap<number, ArrayList<Transition>>;

    constructor (
        readonly startState: number,
        readonly exitState: number // unique accept state for simplicity
    ) {
        this.transitions = new TreeMap<number, ArrayList<Transition>>((a: number, b: number) => a-b);
    }

    public addTransition(s1: number, label: string | null, s2: number): void {
        let s1Tr: ArrayList<Transition>;
        if (this.transitions.has(s1)) {
            s1Tr = this.transitions.get(s1)!;
        } else {
            s1Tr = new ArrayList<Transition>();
            // this.transitions = this.transitions.set(s1, s1Tr);
        }
        s1Tr = s1Tr.add(new Transition(label, s2));
        this.transitions = this.transitions.set(s1, s1Tr);
    }

    public addTransitionKeyValue(tr: [number, ArrayList<Transition>]): void {
        this.transitions = this.transitions.delete(tr[0]); // delete the key
        this.transitions = this.transitions.set(tr[0], tr[1]); // add the key-value pair
    }

    /**
     * Builds and returns the transition relation of a composite-state DFA equivalent to a transition relation of the given NFA.
     * 
     * Create an epsilon closure S0 (a TreeMap of ints) of the start state s0, and put it in a worklist (queue).
     * Create an empty DFA transition relation (a TreeMap of TreeSet<int>). This is mapping of a composite state (an epsilon
     * closed state of numbers) to a mapping between a label (a non-null string) to a composite state. 
     * 
     * Repeatedly choose composite state S from the worklist. If it is not already in the TreeSet of the DFA transition relation,
     * compute for every non-epsilon label the set T of states reachable by that label from state s in S.
     * Compute the epsilon closure tClose of every such state T and put it in the worklist. 
     * Then add the transition S -lab-> tClose to the DFA transition relation for every label.
     * 
     * @param s0 NFA's start state
     * @param transitions NFA's transition relation
     */
    private compositeDfaTransition(s0: number, transitions: TreeMap<number, ArrayList<Transition>>): TreeMap<TreeSet<number>, TreeMap<string, TreeSet<number>>> {
        const S0 = this.epsilonClose(TreeSet.of(s0), transitions);
        const worklist = [S0];

        let res = new TreeMap<TreeSet<number>, TreeMap<string, TreeSet<number>>>((a: TreeSet<number>, b: TreeSet<number>) => {
            return a.compareTo(b);
        });

        while (worklist.length > 0) {
            const S: TreeSet<number> | undefined = worklist.shift();
            if (S === undefined) throw new Error("S is undefined");
            if (!res.has(S)) {
                // The S -lab-> T transition relation being constructed for a given S
                let stateTr = new TreeMap<string, TreeSet<number>>();
                // For all s in S, consider all transitions s -lab-> t
                for (const s of S) {
                    // For all non-epsilon transitions s -lab-> t, add t to T
                    const transitionsForState = transitions.get(s);
                    if (transitionsForState === undefined) {
                        continue; // end state does not have any transitions
                    }
                    for (const tr of transitionsForState) {
                        // non epsilon transitions
                        if (tr.getLabel() !== null) {
                            // let toState: TreeSet<number>;
                            const label = tr.getLabel()!;
                            if (stateTr.has(label)) { // there is already a transition for this label
                                let toState = stateTr.get(label)!;
                                toState = toState.add(tr.getTarget());
                                stateTr = stateTr.set(label, toState);
                            } else { // No transitions on this label yet
                                const toState = TreeSet.of(tr.getTarget());
                                stateTr = stateTr.set(label, toState);
                            }
                        }
                    }
                }
                // Epsilon-close all T such that S -lab-> T, and put on worklist
                let stateTrClosed = new TreeMap<string, TreeSet<number>>();
                for (const [key, states] of stateTr.entries()) {
                    const tClose = this.epsilonClose(states, transitions);
                    stateTrClosed = stateTrClosed.set(key, tClose);
                    if (!res.has(tClose)) {
                        worklist.push(tClose);
                    }
                }
                res = res.set(S, stateTrClosed);
            }
        }

        return res;
    }

    /**
     * Helper method to compute the epsilon closure of a set of states
     * in transition relation.
     * 
     * Epsilon closure is the set of all NFA states that are reachable from s by epsilon transitions. 
     * 
     * The algorithm is as follows:
     * Given a set of states S, we initialize a worklist with all states in S.
     * Repeatedly choose a state from s from the worklist, and consider all epsilon transitions s -eps-> s' from s. If s' is in S already,
     * then do nothing; otherwise add s' to S and the worklist. 
     * When the worklist is empty, S is an epsilon-closure; return S. 
     */
    private epsilonClose(states: TreeSet<number>, transitions: TreeMap<number, ArrayList<Transition>>): TreeSet<number> {
        // the worklist initially contains all states in the set
        const worklist = states.toArray();  

        let res = states;

        while (worklist.length > 0) {
            const s = worklist.shift();
            if (s === undefined) throw new Error("cannot dequeue from empty worklist");
            const stateTransitions = transitions.get(s);
            if (stateTransitions === undefined) {
                continue; // end state does not have any transitions
            }
            for (const tr of transitions.get(s)!) {
                if (tr.getLabel() === null && !res.has(tr.getTarget())) {
                    res = res.add(tr.getTarget());
                    worklist.push(tr.getTarget());
                }
            }
        }
        return res;
    }

    /**
     * Creates and returns a renamer, a TreeMap that maps TreeSet<number> to number. 
     * 
     * Given a tree mapping form a set of int to something, create an injective mapping from a set of int to int,
     * by choosing a fresh int for every key in the TreeMap.
     *
     * @param states 
     */
    makeRenamer(states: Array<TreeSet<number>>): TreeMap<TreeSet<number>, number> {
        let renamer = new TreeMap<TreeSet<number>, number>((a: TreeSet<number>, b: TreeSet<number>) => {
            return a.compareTo(b)
        });
        let count = 0;
        for (const state of states) {
            renamer = renamer.set(state, count++);
        }
        return renamer;
    }

    /**
     * Creates and returns a DFA whose states are simple (number) states.
     * 
     * Given a renamer constructed by the makeRenamer() method, and given the composite-state DFA's transition relation,
     * create and return a new transition relation as a TreeMap in which every TreeSet<number> has been replaced by a number,
     * as dictated by the renamer.
     * @param renamer 
     * @param transitions composite state DFA transition relation
     */
    rename(renamer: TreeMap<TreeSet<number>, number>, transitions: TreeMap<TreeSet<number>, TreeMap<string, TreeSet<number>>>): TreeMap<number, TreeMap<string, number>> {
        let newTr = new TreeMap<number, TreeMap<string, number>>((a: number, b: number) => a-b);
        for (const [k, trs] of transitions.entries()) {
            let newktr = new TreeMap<string, number>();
            const entries = trs.entries();
            for (const [trKey, value] of entries) {
                const renamed = renamer.get(value);
                if (renamed === undefined) throw new Error("renamed is undefined");
                newktr = newktr.set(trKey, renamed);
            }
            const newk = renamer.get(k);
            if (newk === undefined) throw new Error("newk is undefined");
            newTr = newTr.set(newk, newktr);
        }
        return newTr;
    }

    /**
     * Creates a set of accept states in the DFA 
     * @param states 
     * @param renamer 
     * @param exit 
     * @returns 
     */
    acceptStates(states: Array<TreeSet<number>>, renamer: TreeMap<TreeSet<number>, number>, exit: number): TreeSet<number> {
        let acceptStates = new TreeSet<number>();

        for (const state of states) {
            if (state.has(exit)) {
                const renamed = renamer.get(state);
                if (renamed === undefined) throw new Error("renamed is undefined");
                acceptStates = acceptStates.add(renamed);
            }
        }
        return acceptStates;
    }



    /**
     * Does the transformation from NFA to DFA.
     * @returns the DFA
     */
    public toDfa(): DFA {
        // 1. Construct composite-state DFA
        const compositeDfaTransition = this.compositeDfaTransition(this.startState, this.transitions); 
        const compositeDfaStart = this.epsilonClose(TreeSet.of(this.startState), this.transitions);
        // 2. Replace composite states with simple (int) states
        const compositeDfaStates = compositeDfaTransition.keys();
        const renamer = this.makeRenamer(compositeDfaStates);
        const simpleDfaTransitions = this.rename(renamer, compositeDfaTransition);
        const simpleDfaStart = renamer.get(compositeDfaStart)
        if (simpleDfaStart === undefined) throw new Error("Simple DFA start state is undefined");

        const simpleDfaAccept = this.acceptStates(compositeDfaStates, renamer, this.exitState);
        return new DFA(simpleDfaStart, simpleDfaAccept, simpleDfaTransitions);
    }

    // Write the NFA to a dot file for visualization.
    public writeDot(filename: string): void {
        const fs = require('fs');
        let content = "digraph nfa {\n";
        content += "  size=\"11,8.25\";\n  rankdir=LR;\n  node[shape=circle];\n";
        content += "  start [style=invis];\n";
        content += `  start -> d${this.startState};\n`;
        // Mark the exit (accept) state with double circle
        content += `  d${this.exitState} [peripheries=2];\n`;
        // Write each transition
        this.transitions.forEach((transList, s) => {
        for (let i = 0; i < transList.size(); i++) {
            const tr = transList.get(i);
            if (tr === undefined) throw new Error("Transition is undefined");

            const lab = tr.getLabel() === null ? "eps" : tr.getLabel();
            content += `  d${s} -> d${tr.getTarget()} [label="${lab}"];\n`;
        }
        });
        content += "}\n";

        const dir = './out';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dir + "/" + filename, content);
        console.log(`Wrote NFA dot file to ${filename}`);
    }

    toString(): string {
        return `NFA start=${this.startState} exit=${this.exitState}`;
    }

}

class DFA {
    
    constructor(
        private readonly startState: number,
        private readonly acceptStates: TreeSet<number>,
        private readonly transitions: TreeMap<number, TreeMap<string, number>>
    ) {
    }

    // Write the DFA to a dot file.
    public writeDot(filename: string): void {
        const fs = require('fs');
        let content = "digraph dfa {\n";
        content += "  size=\"11,8.25\";\n  rankdir=LR;\n  node[shape=circle];\n";
        content += "  start [style=invis];\n";
        content += `  start -> d${this.startState};\n`;
        // Mark accept states with double circles.
        this.acceptStates.forEach((state: number) => {
            content += `  d${state} [peripheries=2];\n`;
        });
        // Add transitions.
        this.transitions.forEach((transMap, s) => {
            transMap.forEach((target, label) => {
                content += `  d${s} -> d${target} [label="${label}"];\n`;
            });
        });
        content += "}\n";

        const dir = './out';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dir + "/" + filename, content);
        console.log(`Wrote DFA dot file to ${filename}`);
    }

    toString(): string {
        return `DFA start=${this.startState} accept=${Array.from(this.acceptStates).join(",")}`;
    }
}

abstract class RegexBase {
    abstract makeNfa(names: NameSource): NFA;
}

/**
 * Represents the empty set in the regular expression.
 */
class Eps extends RegexBase {

    constructor() {
        super();
    }

    public makeNfa(names: NameSource): NFA {
        const s0s = names.next();
        const s0e = names.next();
        const nfa0 = new NFA(s0s, s0e);
        nfa0.addTransition(s0s, null, s0e);

        return nfa0;
    }
}


/**
 * Represents a symbol in the regular expression.
 */
class Sym extends RegexBase {

    constructor(
        private readonly _symbol: string
    ) {
        super();
    }

    public makeNfa(names: NameSource): NFA {
        const s0s = names.next();
        const s0e = names.next();
        const nfa0 = new NFA(s0s, s0e);
        nfa0.addTransition(s0s, this._symbol, s0e);

        return nfa0;
    }
}

/**
 * Represents a sequence of two regular expressions.
 */
class Seq extends RegexBase {

    constructor(
        private readonly _r1: RegexBase,
        private readonly _r2: RegexBase
    ) {
        super();
    }

    public makeNfa(names: NameSource): NFA {
        const nfa1 = this._r1.makeNfa(names);
        const nfa2 = this._r2.makeNfa(names);
        const nfa0 = new NFA(nfa1.startState, nfa2.exitState);

        for (const [s, trs] of nfa1.transitions.entries()) {
            nfa0.addTransitionKeyValue([s, trs]);
        }

        for (const [s, trs] of nfa2.transitions.entries()) {
            nfa0.addTransitionKeyValue([s, trs]);
        }

        nfa0.addTransition(nfa1.exitState, null, nfa2.startState);

        return nfa0;
    }
}

/**
 * Represents an alternation (union) of two regular expressions.
 */
class Alt extends RegexBase {

    constructor(
        private readonly _r1: RegexBase,
        private readonly _r2: RegexBase
    ) {
        super();
    }

    public makeNfa(names: NameSource) {
        const nfa1 = this._r1.makeNfa(names);
        const nfa2 = this._r2.makeNfa(names);
        const s0s = names.next();
        const s0e = names.next();
        const nfa0 = new NFA(s0s, s0e);

        for (const [s, trs] of nfa1.transitions.entries()) {
            nfa0.addTransitionKeyValue([s, trs]);
        }

        for (const [s, trs] of nfa2.transitions.entries()) {
            nfa0.addTransitionKeyValue([s, trs]);
        }

        nfa0.addTransition(s0s, null, nfa1.startState);
        nfa0.addTransition(s0s, null, nfa2.startState);
        nfa0.addTransition(nfa1.exitState, null, s0e);
        nfa0.addTransition(nfa2.exitState, null, s0e);

        return nfa0;
    }
}

/**
 * Represents the Kleene star operation on a regular expression.
 */
class Star extends RegexBase {
    constructor(
        private readonly _r: RegexBase
    ) {
        super();
    }

    public makeNfa(names: NameSource): NFA {
        const nfa1 = this._r.makeNfa(names);
        const s0s = names.next();
        const nfa0 = new NFA(s0s, s0s);

        for (const [s, trs] of nfa1.transitions.entries()) {
            nfa0.addTransitionKeyValue([s, trs]);
        }

        nfa0.addTransition(s0s, null, nfa1.startState);
        nfa0.addTransition(nfa1.exitState, null, s0s);

        return nfa0;
    }
}

/**
 * Write the NFA and DFA to dot files for visualization.
 * @param filePrefix 
 * @param r 
 */
function buildAndShow(filePrefix: string, r: RegexBase): void {
    const nfa = r.makeNfa(new NameSource());
    console.log(nfa.toString());
    console.log("Writing NFA graph to file");
    nfa.writeDot(filePrefix + "nfa.dot");
    console.log("---");
    const dfa = nfa.toDfa();
    console.log(dfa.toString());
    console.log("Writing DFA graph to file");
    dfa.writeDot(filePrefix + "dfa.dot");
    console.log();
}


function main() {
    const a = new Sym("A");
    const b = new Sym("B");
    const _ = new Sym("C");
    const abStar = new Star(new Alt(a, b));
    const bb = new Seq(b, b);
    const r = new Seq(abStar, new Seq(a, b));

    // The regular expression (a|b)*ab
    buildAndShow("ex1", r);

    // The regular expression ((a|b)*ab)*
    buildAndShow("ex2", new Star(r));

    // The regular expression ((a|b)*ab)((a|b)*ab)
    buildAndShow("ex3", new Seq(r, r));

    // The regular expression (a|b)*abb, from ASU 1986 p 136
    buildAndShow("ex4", new Seq(abStar, new Seq(a, bb)));

    // SML reals: sign?((digit+(\.digit+)?))([eE]sign?digit+)?
    const d = new Sym("digit");
    const dPlus = new Seq(d, new Star(d));
    const s = new Sym("sign");
    const sOpt = new Alt(s, new Eps());
    const dot = new Sym(".");
    const dotDigOpt = new Alt(new Eps(), new Seq(dot, dPlus));
    const mant = new Seq(sOpt, new Seq(dPlus, dotDigOpt));
    const e = new Sym("e");
    const exp = new Alt(new Eps(), new Seq(e, new Seq(sOpt, dPlus)));
    const smlReal = new Seq(mant, exp);
    buildAndShow("ex5", smlReal);

}

main();