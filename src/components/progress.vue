<template>
    <div class="Load-bg" id="loadingDiv" v-if=" value != 100 ">
        <div class="Load-tex">
            <div class="Load-logo">
                <em id="pecentageText"> {{value}} % </em>
                <h2><span id="pecentageWidth" :style="{ width: value + '%' }"></span></h2>
                <p class="Load-Sketch">加载中...</p>
            </div>
        </div>
    </div>
</template>

<script>

export default {

    name: 'progress',

    props: {
        value: {
            type: Number,
            default: 0
        }
    }

}

</script>

<style lang="scss">
.Load-bg {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    z-index: 900;
    background-image: linear-gradient(#000b1c, #000b1c), linear-gradient(#00173a, #00173a);
    background-blend-mode: normal, normal;
    box-shadow: 0px 0px 20px 0px rgba(0, 84, 243, 0.1);
}

.Load-tex {
    width: 100%;
    height: 100%;
    font-size: 0.5rem;
    color: #666;
    display: table;
}
.Load-logo {
    text-align: center;
    font-size: 1rem;
    vertical-align: middle;
    display: table-cell;
}
.Load-logo h2 {
    width: 50%;
    margin: 1rem auto;
    height: .7rem;
    position: relative;
    background-color: #f9fafc;
    border-radius: 5px;
    opacity: 0.14;
}

.Load-logo h2 em {
    position: absolute;
    top: -3rem;
    left: 0;
    right: 0;
    text-align: center;
    color: #666;
    font-size: 1rem;
}

.Load-logo h2 span {
    height: .7rem;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    background-image: linear-gradient(
        -90deg,
        #1a6afe 0%,
        rgba(0, 85, 243, 0.2) 100%
    );
    border-radius: 5px;
}

.Load-Sketch {
    text-align: center;
    margin: 0.3rem 0;
}
</style>
