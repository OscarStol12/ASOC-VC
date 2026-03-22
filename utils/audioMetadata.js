"use strict";

const { spawn } = require('child_process');

function getLocalMetadata(url) {
    return new Promise((resolve, reject) => {
        const proc = spawn('ffprobe', [
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            url
        ]);

        let rawData = '';

        proc.stdout.on('data', (chunk) => {
            rawData += chunk.toString();
        });

        proc.stderr.on('data', (chunk) => {
            // Log error but don't throw immediately, wait for close
            console.error(`ffprobe stderr: ${chunk}`);
        });

        proc.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`ffprobe exited with code ${code}`));
                return;
            }

            try {
                const json = JSON.parse(rawData);
                const format = json.format;
                
                // Extract info safely
                const info = {
                    title: format?.tags?.title || 'Unknown Title',
                    artist: format?.tags?.artist || 'Unknown Artist',
                    duration: format?.duration ? parseFloat(format.duration).toFixed(2) : 'Unknown'
                };
                
                resolve(info);
            } catch (e) {
                reject(new Error(`Failed to parse ffprobe output: ${e.message}`));
            }
        });
    });
}

function getYouTubeMetadata(url) {
    return new Promise((resolve, reject) => {
        const metadataProc = spawn('yt-dlp', [
            '--cookies', `${PROJECT_ROOT}/cookies/yt-cookies.txt`,
            '--dump-json',
            '--no-playlist',
            '--js-runtimes', 'node',
            '--remote-components', 'ejs:github',
            '--extractor-args', 'youtube:player_client=android',
            url
        ], {stdio: ['ignore', 'pipe', 'pipe']});

        let rawData = '';

        metadataProc.stdout.on('data', (chunk) => {
            rawData += chunk.toString();
        });

        metadataProc.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Metadata extraction failed with code ${code}`));
                return;
            }

            try {
                const metadata = JSON.parse(rawData);
                resolve({
                    title: metadata.title || 'Unknown Title',
                    artist: metadata.uploader || metadata.channel || 'Unknown Artist',
                    duration: parseFloat(metadata.duration) ?? 'Unknown Duration',
                    thumbnail: metadata.thumbnail || null,
                    url: metadata.webpage_url || url
                });
            } catch (e) {
                reject(new Error(`Failed to parse metadata: ${e.message}`));
            }
        });
    });
}

function getPlaylistVideos(url) {
    return new Promise((resolve, reject) => {
        const pythonPath = `${process.env.HOME}/.local/share/pipx/venvs/yt-dlp/bin/python`;
        
        const proc = spawn('yt-dlp', [
            '--cookies', `${PROJECT_ROOT}/cookies/yt-cookies.txt`,
            '--flat-playlist',
            '--dump-json',
            '--no-download',
            '--js-runtimes', 'node',
            '--remote-components', 'ejs:github',
            '--extractor-args', 'youtube:player_client=android',
            url
        ], { stdio: ['ignore', 'pipe', 'pipe'] });

        let rawData = '';
        const videos = [];

        proc.stdout.on('data', (chunk) => {
            rawData += chunk.toString();

            const lines = rawData.split('\n');
            const lastLine = lines.pop();

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const videoInfo = JSON.parse(line);
                        if (videoInfo._type === 'video' || videoInfo.id) {
                            videos.push({
                                url: videoInfo.url || `https://www.youtube.com/watch?v=${videoInfo.id}`,
                                title: videoInfo.title,
                                uploader: videoInfo.uploader,
                                duration: videoInfo.duration || 0
                            });
                        }
                    } catch (e) {
                        
                    }
                }
            }
            rawData = lastLine;
        });

        proc.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Playlist extraction failed with code ${code}`));
            } else {
                resolve(videos);
            }
        });
    });
}

module.exports = {getLocalMetadata, getYouTubeMetadata, getPlaylistVideos};