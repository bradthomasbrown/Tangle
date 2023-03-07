import { createHash } from 'node:crypto'
import { EventEmitter } from 'node:events'
let ruler = (x) => Math.floor(Math.log2(x ^ x + 1))
let H = createHash('sha256')

class Verifier extends EventEmitter {

    constructor() {
        super()
        this.roots = []
        this.count = 0
    }

    // users use insert to insert some data into the verifier
    // this emits an event that a prover can listen to
    // the prover listens to this event to know when to update its
    // knowledge of the verifier's data
    insert(data) {
        let hash = H.copy()
        hash.update(data)
        let message = hash.digest('hex')
        let rulerNumber = ruler(this.count)
        for (let i = 0; i < rulerNumber; i++) {
            let hash = H.copy()
            hash.update(`${this.roots[i]}${message}`)
            message = hash.digest('hex')
        }
        this.roots[rulerNumber] = message
        this.count++
        this.emit('insert', data)
    }

    // a user can prove an element exists in the structure by submitting
    // the element and a proof
    // the proof is constructed by the prover
    verify = (element, proof) => {
        let hash = H.copy()
        hash.update(element)
        let n = hash.digest('hex')
        let hashes = proof.hashes
        let i = proof.index
        while (hashes.length > 0) {
            let m = hashes[0]
            if (i % 2 === 1) [n, m] = [m, n]
            let hash = H.copy()
            hash.update(`${n}${m}`)
            n = hash.digest('hex')
            i = Math.floor(i / 2)
            hashes = hashes.slice(1)
        }
        return n === this.roots[proof.subtree]
    }

}

class Prover {

    // the prover is created with a listener to capture all data sent to
    // a verifier
    // it is important that the prover has access to all of the data
    // submitted to the verifier to ensure proofs are accurate
    constructor(verifier) {
        this.data = []
        this.verifier = verifier
        verifier.on('insert', data => this.data.push(data))
    }

    // a user can submit an element to this function to obtain a proof
    // that proof can be used by the verifier to prove an element exists
    getProof = element => {
        let id = this.data.indexOf(element)
        let subtrees = this.getSubtrees(id)
        let firstSubtree = subtrees[0]
        let lastSubtree = subtrees[subtrees.length - 1]
        let subtree = lastSubtree
        if (subtree == 0) return { hashes: [], index: 0, subtree: 0 }
        let index = id % 2 ** subtree
        let tree = this.getTree(id, subtree)
        let proof = this.buildProof(index, tree)
        return {
            hashes: proof, 
            index: id % 2 ** subtree, 
            subtree: subtree
        }
    }

    getSubtrees(id) {
        let ids = [id]
        let nextAdd = x => x + 2 ** ruler(x)
        let nextDel = x => x + 2 ** (ruler(x) + 1)
        let fn = () => {
            let na = nextAdd(ids[ids.length - 1])
            let nd = nextDel(ids[0])
            if (na >= this.verifier.count && nd >= this.verifier.count)
                return ids.map(id => ruler(id))
            if (na <= nd) ids.push(na)
            else ids.shift()
            return () => fn(ids)
        }
        let thunk = fn()
        while (typeof thunk === 'function') thunk = thunk()
        return thunk
    }

    getTree(id, subtree) {
        let tree = []
        let index = id % 2 ** subtree
        let start = id - index
        let leaves = this.data
            .slice(start, start + 2 ** subtree)
            .map(data => {
                let hash = H.copy()
                hash.update(data)
                return hash.digest('hex')
            })
        tree.push(leaves)
        while (tree[tree.length - 1].length > 2) {
            let tmp = [...tree[tree.length - 1]]
            tree.push([])
            while (tmp.length > 0) {
                let foo = tmp.splice(0, 2)
                let hash = H.copy()
                hash.update(`${foo[0]}${foo[1]}`)
                tree[tree.length - 1].push(hash.digest('hex'))
            }
        }
        return tree
    }

    buildProof = (index, tree) => {
        let proof = []
        for (
            let branch = 0; 
            branch < tree.length; 
            index = parseInt(String(index / 2)),
                branch++
        ) {
            let nodes = tree[branch]
            proof.push(nodes[index + index % 2 * -2 + 1])
        }
        return proof
    }

}

let verifier = new Verifier()
let prover = new Prover(verifier)

// insert some data into verifier
verifier.insert('hello world')
verifier.insert('foo')
verifier.insert('bar')
verifier.insert('baz')

let element = 'hello world'
let proof = prover.getProof(element)
let verified = verifier.verify(element, proof)
console.log(element)
console.log(proof)
console.log(verified)