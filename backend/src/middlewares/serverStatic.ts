import express from 'express'

export default function serveStatic(baseDir: string) {
    return express.static(baseDir, {
        dotfiles: 'ignore',
        index: false,
        redirect: false,
    })
}
