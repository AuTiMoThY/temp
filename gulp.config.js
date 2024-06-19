const project = "154_sports_activity_europe";
const version = "20240605";

const entry = 'src';
const output = 'dist';
const prodOutput = 'dist_prod';

// 使用 export default 導出配置物件
export default {
    project: project,
    version: version,
    port: 8082,
    entry: `./${entry}`,
    output: `./${output}`,
    prodOutput: `./${prodOutput}`,
    entryPath: {
        sass: `./${entry}/sass`,
    },
    sassOpt: {
        outputStyle: 'expanded',
        includePaths: ['node_modules/']
    },
    sassVar: {
        PROJECT_NAME: project,
        VERSION: version
    },
    njkOpt: {
        PROJECT_NAME: project,
    }
};
