const Core = require('@actions/core');
const Github = require('@actions/github');
const Path = require("path");
const fs = require('fs');
const download = require('download');
const child_process = require('child_process');

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
            'darwin': new RegExp(`WasmVM${dev_suffix}.*\.pkg`)
        };
        return release.data.assets.find(asset => asset.name.match(platform_map[process.platform]));
    })
    // Download package
    .then(package => {
        return new Promise(resolve => {
            child_process.spawn(`wget ${package.browser_download_url}`, {stdio: [0, 1, 2], shell: true})
            .on('close', code => {
                if(code){
                    Core.error("Download failed")
                }else{
                    resolve(package.name);
                }
            })
        })
    })
    .then(file_path => {
        const command_map = {
            'linux' : `sudo dpkg -i ${file_path}`,
            'darwin': `sudo installer -pkg ${file_path} -target /`
        };
        return new Promise(resolve => {
            child_process.spawn(command_map[process.platform], {stdio: [0, 1, 2], shell: true})
            .on('close', code => {
                if(code){
                    Core.error("Install failed")
                }else{
                    resolve();
                }
            })
        })
    })
    .then(() => {
        console.log("WasmVM installed")
    })
} catch (error) {
    Core.setFailed(error.message);
}