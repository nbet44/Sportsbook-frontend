import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslator } from '@hooks/useTranslator'
// import { history } from '@src/history'
import { useHistory } from "react-router-dom"

const CategoriesCmp = () => {
    const userData = useSelector((state) => state.auth.userData)
    const [getTextByLanguage] = useTranslator()
    const history = useHistory()

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
                        {
                            userData.role === "agent" || userData.role === "admin" ? (
                                <li><span onClick={() => history.push("/admin/user-manage")}>{getTextByLanguage("User List")}</span></li>
                            ) : null
                        }
                        {/* {
                            userData && userData.permission && userData.permission.agent ? (
                                <li><span onClick={() => history.push("/admin/user-list")}>{getTextByLanguage("User List")}</span></li>
                            ) : null
                        } */}

                        <li><span onClick={() => history.push("/admin/bet-list")}>{getTextByLanguage("Bet List")}</span></li>

                        {
                            userData && userData.role !== "user" ? (
                                <li><span onClick={() => history.push("/admin/create-new-player")}>
                                    {userData.role === "agent" ? getTextByLanguage("Create New Player") : getTextByLanguage("Create New Player/Agent")}
                                </span></li>
                            ) : null
                        }

                        <li><span onClick={() => history.push('/admin/transaction')}>{getTextByLanguage('Transaction')}</span></li>
                        <li><span onClick={() => history.push("/admin/casino-list")}>{getTextByLanguage("Casino List")}</span></li>

                        {
                            userData.role === "admin" ? (
                                <li><span onClick={() => history.push("/admin/setting")}>{getTextByLanguage("Setting")}</span></li>
                            ) : null
                        }


                        {
                            /* {userData && userData.permission && userData.permission.agent ? (
                                <li><a href="/admin/create-new-agent" data-nsfw-filter-status="swf">{getTextByLanguage("Create New Agent")}</a></li>
                            ) : ""} */
                        }
                        {/* {userData && userData.permission && userData.permission.agent ? (
                            <li><a href="/admin/agent-list" data-nsfw-filter-status="swf">{getTextByLanguage("Agent List")}</a></li>
                        ) : ""} */}
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
