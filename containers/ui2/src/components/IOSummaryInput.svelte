<script lang="ts">
    import { Subreq } from '../stores/Subreq.mjs'
    export let subreq: Subreq
    $: input = subreq?.input ?? 0n
    function metric(n: bigint) {
        if (n === undefined) return '? '
        if (n === 0n) return '0 '
        let length = `${n}`.length
        let decimals = 18
        let base = length - decimals
        if (base > 0) base = base - 1
        else base = base - 3
        base = base - (base % 3)
        if (base > 30) base = 30
        if (base < -30) base = -30
        let prefix = ''
        switch (base) {
            case  30: prefix = 'Q'; break; case  27: prefix = 'R'; break;
            case  24: prefix = 'Y'; break; case  21: prefix = 'Z'; break;
            case  18: prefix = 'E'; break; case  15: prefix = 'P'; break;
            case  12: prefix = 'T'; break; case   9: prefix = 'G'; break;
            case   6: prefix = 'M'; break; case   3: prefix = 'k'; break;
            case  -3: prefix = 'm'; break; case  -6: prefix = 'μ'; break;
            case  -9: prefix = 'n'; break; case -12: prefix = 'p'; break;
            case -15: prefix = 'f'; break; case -18: prefix = 'a'; break;
            case -21: prefix = 'z'; break; case -24: prefix = 'y'; break;
            case -27: prefix = 'r'; break; case -30: prefix = 'q'; break;
        }
        let nStr = `${n}`
        let sliceEnd = nStr.length - base - decimals
        nStr = nStr.slice(0, sliceEnd)
        return `${nStr} ${prefix}`
    }
</script>

{metric(input)}