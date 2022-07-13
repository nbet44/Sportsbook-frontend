import { useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { Row, Col, Form, FormGroup, Input, Button } from 'reactstrap'
import '@styles/base/pages/page-auth.scss'
import useJwt from '@src/auth/jwt/useJwt'
import { handleLogin } from '@store/actions/auth'
import { AbilityContext } from '@src/utility/context/Can'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { getHomeRouteForLoggedInUser, isObjEmpty } from '@utils'

const Login = () => {
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')

  const { errors, handleSubmit } = useForm()

  const logoImage = require("@src/assets/images/logo/logo.svg").default

  const onSubmit = data => {
    if (isObjEmpty(errors)) {
      useJwt
        .login({ userId, password, created: Date.now() })
        .then(res => {
          if (res.data.status !== 200) {
            toast.error(res.data.data)
            return false
          }
          const data = { ...res.data.userData, accessToken: res.data.accessToken ? res.data.accessToken : res.data.token, refreshToken: res.data.refreshToken ? res.data.refreshToken : res.data.token }
          dispatch(handleLogin(data))
          window.location.href = (getHomeRouteForLoggedInUser(data.role))
          toast.success("success")
        })
        .catch(err => console.log(err))
    }
  }

  return (
    <div className='auth-wrapper auth-v2'>
      <Row className='auth-inner m-0'>
        <Col className='d-lg-flex align-items-center px-0' lg='12' sm='12'>
          <div className='w-100 h-100 d-lg-flex align-items-center justify-content-center login-page'>
            <Col className='d-flex align-items-center px-2 p-lg-5 h-100' lg='4' sm='12'>
              <Col className='px-xl-2 mx-auto text-center' sm='8' md='6' lg='12'>
                <img className="img-fluid" src={logoImage} width='80%' />
                <Form className='auth-login-form mt-2' onSubmit={handleSubmit(onSubmit)}>
                  <FormGroup>
                    <Input
                      onChange={e => setUserId(e.target.value)}
                      value={userId}
                      className="login-input"
                      type='text'
                      id='login-username'
                      placeholder='Login'
                      autoFocus required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Input
                      onChange={e => setPassword(e.target.value)}
                      value={password}
                      className="login-input"
                      type='password'
                      id='login-password'
                      placeholder='Password'
                      autoFocus required />
                  </FormGroup>
                  <Button.Ripple type="submit" className="login-btn" color='primary' block>
                    Sign in
                  </Button.Ripple>
                </Form>
              </Col>
            </Col>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Login
