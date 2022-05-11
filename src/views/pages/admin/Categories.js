import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslator } from '@hooks/useTranslator'

const CategoriesCmp = () => {
    const userData = useSelector((state) => state.auth.userData)
    const [getTextByLanguage] = useTranslator()

    return (
        <div className="content-tab d-flex">
            <ul className="path mr-2">
                {userData.role === "reporter" ? (
                    <>
                        <li><a href="/admin/pre-result" data-nsfw-filter-status="swf">{getTextByLanguage("Pre Result")}</a></li>
                        <li><a href="/admin/live-result" data-nsfw-filter-status="swf">{getTextByLanguage("Live Result")}</a></li>
                    </>
                ) : (
                    <>
                        <li><a href="/admin/bet-list" data-nsfw-filter-status="swf">{getTextByLanguage("Bet List")}</a></li>
                        <li><a href="/admin/casino-list" data-nsfw-filter-status="swf">{getTextByLanguage("Casino List")}</a></li>
                        {userData && userData.permission && userData.permission.player ? (
                            <React.Fragment>
                                <li><a href="/admin/user-list" data-nsfw-filter-status="swf">{getTextByLanguage("User List")}</a></li>
                                <li><a href="/admin/create-new-player" data-nsfw-filter-status="swf">{getTextByLanguage("Create New Player")}</a></li>
                            </React.Fragment>
                        ) : ""}
                        {userData && userData.permission && userData.permission.agent ? (
                            <React.Fragment>
                                <li><a href="/admin/agent-list" data-nsfw-filter-status="swf">{getTextByLanguage("Agent List")}</a></li>
                                <li><a href="/admin/create-new-agent" data-nsfw-filter-status="swf">{getTextByLanguage("Create New Agent")}</a></li>
                            </React.Fragment>
                        ) : ""}
                        <li><a href="/admin/transaction" data-nsfw-filter-status="swf">{getTextByLanguage("Transaction")}</a></li>
                        {userData.role === "admin" ? (
                            <React.Fragment>
                                <li><a href="/admin/setting" data-nsfw-filter-status="swf">{getTextByLanguage("Setting")}</a></li>
                            </React.Fragment>
                        ) : ""}
                    </>
                )}
            </ul>
            {/* <div style={{ float: "right" }}>
                <a href="/" className="back-site" data-nsfw-filter-status="swf">Back To Site</a>
            </div> */}
        </div>
    )
}

export default CategoriesCmp
