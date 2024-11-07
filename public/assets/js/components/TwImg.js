const TwImg = {
    props: {
        defaultSrc: String,
        hoverSrc: String,
        alt: String,
        w: String,
        h: String
    },
    template: `
        <div class="tw_img" :style="{ '--w': w, '--h': h }">
            <img :src="defaultSrc" :alt="alt" class="default" loading="lazy">
            <img v-if="hoverSrc" :src="hoverSrc" class="hover" loading="lazy">
        </div>
    `
};
