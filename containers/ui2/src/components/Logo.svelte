<script lang="ts">
    import { quartInOut, sineInOut } from "svelte/easing";
    import { draw, fade, scale } from "svelte/transition"
    let condition = false
    setTimeout(() => condition = true)

</script>

{#if condition}
    <span>
        <div transition:scale={{
            duration: 2000,
            delay: 1000,
            start: Math.min(window.innerWidth / 50, 8),
            opacity: 1,
            easing: quartInOut
        }}>
            <svg width="286.56pt" height="262.8pt" viewBox="0 0 286.56 262.8">
                <g>
                    <path class="path-outline" transition:draw="{{ duration: 1000, delay: 200, easing: sineInOut }}" transform="matrix(-0.480194260592207 0.831720856848673 -0.831720856848673 -0.480194260592207 245.220182499059 47.6980833745325)" d="M156.909 26.2359C58.7542 22.4972 23.8153 70.7115 23.0169 90.2641C24.9384 114.624 90.0164 136.257 154.735 94.9174C160.055 101.457 165.212 104.751 170.596 109.528C102.262 154.61 14.8969 143.855 0.79973 98.0404C-9.4334 48.6408 80.3335 -18.9276 167.235 4.95652C162.478 15.5047 162.486 16.8508 156.909 26.2359Z"/>
                    <path class="path-outline" transition:draw="{{ duration: 1000, delay: 400, easing: sineInOut }}" id="shape1" transform="matrix(-0.480194260592207 -0.831720856848672 0.831720856848672 -0.480194260592207 193.674443167546 299.46778337332)" d="M157.2 26.3686C59.0451 22.6299 23.8102 70.4509 23.0118 90.0035C24.9333 114.364 90.3627 135.969 155.082 94.6291C159.292 100.14 165.311 104.428 170.753 109.252C102.419 154.334 14.8918 143.594 0.794641 97.7799C-9.43849 48.3802 80.9681 -18.9123 167.869 4.97184C163.12 15.5263 162.396 16.3589 157.2 26.3686Z"/>
                    <path class="path-outline" transition:draw="{{ duration: 1000, delay: 0, easing: sineInOut }}" id="shape2" transform="matrix(0.960388521184414 0 0 0.960388521184414 0.447417244159199 128.71733293254)" d="M158.31 26.2489C60.1549 22.5101 23.8023 70.1506 23.0039 89.7033C24.9254 114.063 90.6147 135.529 155.334 94.1895C159.728 100.101 164.941 104.54 170.756 108.979C102.422 154.061 14.8839 143.294 0.786735 97.4796C-9.4464 48.0799 81.9701 -18.8946 168.871 4.98964C164.076 15.4787 163.448 16.1722 158.31 26.2489Z"/>
                </g>
            </svg>
            <svg transition:fade="{{ duration: 2250, delay: 750, easing: sineInOut }}" width="286.56pt" height="262.8pt" viewBox="0 0 286.56 262.8">
                <g>
                    <path class="path-fill" transform="matrix(-0.480194260592207 0.831720856848673 -0.831720856848673 -0.480194260592207 245.220182499059 47.6980833745325)" d="M156.909 26.2359C58.7542 22.4972 23.8153 70.7115 23.0169 90.2641C24.9384 114.624 90.0164 136.257 154.735 94.9174C160.055 101.457 165.212 104.751 170.596 109.528C102.262 154.61 14.8969 143.855 0.79973 98.0404C-9.4334 48.6408 80.3335 -18.9276 167.235 4.95652C162.478 15.5047 162.486 16.8508 156.909 26.2359Z"/>
                    <path class="path-fill" transform="matrix(-0.480194260592207 -0.831720856848672 0.831720856848672 -0.480194260592207 193.674443167546 299.46778337332)" d="M157.2 26.3686C59.0451 22.6299 23.8102 70.4509 23.0118 90.0035C24.9333 114.364 90.3627 135.969 155.082 94.6291C159.292 100.14 165.311 104.428 170.753 109.252C102.419 154.334 14.8918 143.594 0.794641 97.7799C-9.43849 48.3802 80.9681 -18.9123 167.869 4.97184C163.12 15.5263 162.396 16.3589 157.2 26.3686Z"/>
                    <path class="path-fill" transform="matrix(0.960388521184414 0 0 0.960388521184414 0.447417244159199 128.71733293254)" d="M158.31 26.2489C60.1549 22.5101 23.8023 70.1506 23.0039 89.7033C24.9254 114.063 90.6147 135.529 155.334 94.1895C159.728 100.101 164.941 104.54 170.756 108.979C102.422 154.061 14.8839 143.294 0.786735 97.4796C-9.4464 48.0799 81.9701 -18.8946 168.871 4.98964C164.076 15.4787 163.448 16.1722 158.31 26.2489Z"/>
                </g>
            </svg>
        </div>
    </span>
{/if}

<style>
    span {
        margin-top: 20px;
        height: 50px;
        width: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
    }
    div {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        align-items: center;
        transition: top 2s ease-in-out;
        height: 50px;
        width: 50px;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
    }
    .path-outline {
        stroke: #e91e63;
        stroke-width: 2px;
        fill: transparent;
        stroke-linejoin: round;
    }
    svg {
        position: absolute;
        scale: 0.125;
    }
    @media (prefers-color-scheme: dark) {
        .path-fill {
            fill: white
        }
    }
    @media (prefers-color-scheme: light) {
        .path-fill {
            fill: black
        }
    }
</style>