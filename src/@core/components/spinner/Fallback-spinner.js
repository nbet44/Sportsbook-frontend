// ** Logo
import logo from '@src/assets/images/logo.png'
import loading from '@src/assets/images/gif.gif'

const SpinnerComponent = () => {
  return (
    <div className='fallback-spinner vh-100'>
      {/* <img className='fallback-logo img-fluid' src={logo} alt='logo' style={{ maxWidth: "200px", left: "calc(50% - 65px)" }} /> */}
      <h4 className='fallback-logo mt-1' style={{ left: "calc(50% - 50px)", color: "white", top: "50%" }}>Please Wait...</h4>
      <div className='loading' style={{ left: "50%", top: "45%" }} >
        <img className='fallback-logo img-fluid' src={loading} alt='logo' />
        {/* <div className='effect-1 effects'></div>
        <div className='effect-2 effects'></div>
        <div className='effect-3 effects'></div> */}
      </div>
    </div>
  )
}

export default SpinnerComponent
