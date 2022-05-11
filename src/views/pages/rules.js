import React, { useCallback, useEffect, useState } from 'react'
import {
    TabContent, TabPane, Nav, NavItem, NavLink,
    Card, CardHeader, CardBody, CardTitle, CardText, CardLink
} from 'reactstrap'

import HeaderCmp from '../Header'

const rulesPage = (props) => {

    return (
        <React.Fragment>
        <div>
            <HeaderCmp></HeaderCmp>
            
            <Card>
                <CardBody className="py-1">
                </CardBody>
            </Card>
        </div>
        </React.Fragment>
    )
}

export default rulesPage
