import { useState } from "react"
import { useTranslation } from "react-i18next"
import getUuid from 'uuid-by-string'

export const convertIdFromText = (data) => {
    return getUuid(data.toString())
}

export const useTranslator = () => {
    const { t, i18n } = useTranslation('common')
    // console.log("Draw", getUuid("Draw"))
    const setValue = value => {
        if (i18n.language !== "en") {
            if (t(convertIdFromText(value)).toString().split("-").length >= 4) {
                return value
            }
            return t(convertIdFromText(value))
        } else {
            return value
        }
    }

    return [setValue]
}
