const TwImg = {
    props: {
        defaultSrc: String,
        hoverSrc: String,
        alt: String
    },
    template: `
        <div class="tw_img">
            <img :src="defaultSrc" :alt="alt" class="default" loading="lazy">
            <img v-if="hoverSrc" :src="hoverSrc" class="hover" loading="lazy">
        </div>
    `
};