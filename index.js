const Core = require('@actions/core');
const Github = require('@actions/github');
const Path = require("path")
const fs = require('fs')

try {
    // Get octokit
    const Octokit = Github.getOctokit(Core.getInput('token'));
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