const Core = require('@actions/core');
const Github = require('@actions/github');
const Path = require("path")
const fs = require('fs')
const https = require('https')

try {
    // Get octokit
    const Octokit = Github.getOctokit(Core.getInput('token'));
    // Get release
    Promise.resolve(Core.getInput('version'))
    .then(version => {
        if(version){
            return Octokit.rest.repos.getReleaseByTag({
                owner: "WasmVM",
                repo: "WasmVM",
                tag: version
            });
        }else{
            return Octokit.rest.repos.getLatestRelease({
                owner: "WasmVM",
                repo: "WasmVM"
            });
        }
    })
    // Get package link according to platform
    .then(release => {
        const dev_suffix = (Core.getInput('dev') == "true") ? "-dev" : "";
        const platform_map = {
            'linux' : new RegExp(`wasmvm${dev_suffix}_.*\.deb`),
            'darwin': new RegExp(`WasmVM${dev_suffix}\.pkg`)
        };
        return release.data.assets.find(asset => asset.name.match(platform_map[process.platform]));
    })
    // Download package
    .then(package => {
        return new Promise(resolve => {
            const file_path = Path.resolve(package.name);
            const fout = fs.createWriteStream(file_path);
            https.get(package.browser_download_url, res => {
                res.pipe(fout);
                fout.on('finish', () => {
                    fout.close(() => {
                        resolve(file_path)
                    })
                })
            })
        })
    })
    .then(file_path => {
        // FIXME:
        fs.readdir(Path.resolve(), (err, files) => {
            files.forEach(element => {
                console.log(element)
            });
        })
    })

    // // Read & parse release note
    // let note_content = fs.readFileSync(Path.resolve(Core.getInput('note')), {encoding: 'utf8'});
    // const [tag_str, tag_name] = note_content.match(/^\`(.*)\`\n/);
    // note_content = note_content.substring(tag_str.length);
    // const [name_str, release_name] = note_content.match(/^#\s+(.*)\n/);
    // note_content = note_content.substring(name_str.length);
    // // Get assets
    // const asset_paths = Core.getInput('assets').length ? Core.getInput('assets').split("\n").map(s => s.trim()) : [];
    // // Create release
    // Octokit.rest.repos.createRelease({
    //     owner: Github.context.repo.owner,
    //     repo: Github.context.repo.repo,
    //     tag_name: tag_name,
    //     target_commitish: Github.context.sha,
    //     name: release_name,
    //     body: note_content,
    //     draft: Core.getInput('draft', {trimWhitespace: true}) == "true"
    // })
    // // Upload assets
    // .then(res => Promise.all(asset_paths.map(asset => Octokit.rest.repos.uploadReleaseAsset({
    //     owner: Github.context.repo.owner,
    //     repo: Github.context.repo.repo,
    //     release_id: res.data.id,
    //     name: Path.basename(asset),
    //     data: fs.readFileSync(asset)
    // }))))
    // .then(() => {
    //     console.log("Release created!")
    // })
} catch (error) {
    Core.setFailed(error.message);
}