import { useState } from "react"
import { useTranslation } from "react-i18next"
import getUuid from 'uuid-by-string'

export const convertIdFromText = (data) => {
    return getUuid(data.toString())
}

export const useTranslator = () => {
    const { t, i18n } = useTranslation('common')
    /*eslint-disable */
    console.log('"' + getUuid("Weekly credit") + '"' + ':' + '"' + 'Weekly credit' + '"')
    console.log('"' + getUuid("Less credit") + '"' + ':' + '"' + 'Less credit' + '"')
    console.log('"' + getUuid("Extra credit") + '"' + ':' + '"' + 'Extra credit' + '"')
    console.log('"' + getUuid("Weekly balance reset") + '"' + ':' + '"' + 'Weekly balance reset' + '"')
    console.log('"' + getUuid("Weekly balance reset day") + '"' + ':' + '"' + 'Weekly balance reset day' + '"')
    console.log('"' + getUuid("Auto weekly credit") + '"' + ':' + '"' + 'Auto weekly credit' + '"')
    console.log('"' + getUuid("Add extra credit") + '"' + ':' + '"' + 'Add extra credit' + '"')
    console.log('"' + getUuid("Withdrawal credit") + '"' + ':' + '"' + 'Withdrawal credit' + '"')
    console.log('"' + getUuid("Platform Commission") + '"' + ':' + '"' + 'Platform Commission' + '"')
    console.log('"' + getUuid("Sports Commission") + '"' + ':' + '"' + 'Sports Commission' + '"')
    console.log('"' + getUuid("Casino Commission") + '"' + ':' + '"' + 'Casino Commission' + '"')
    console.log('"' + getUuid("Edit credit") + '"' + ':' + '"' + 'Edit credit' + '"')
    /*eslint-enable */
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
