// ** Icons Import
import { Heart } from 'react-feather'


const Footer = () => {
  const logoImage = require("@src/assets/images/logo.png").default

  return (
    <p className='clearfix mb-0 bt-0'>
      <span className='float-md-left d-block d-md-inline-block'>
        <img className="img-fluid mr-1" src={logoImage} style={{maxWidth: "200px"}} />
        { }

        <a href="/rules" className='text-white'>
          <span className='d-none d-sm-inline-block'>חוקים</span>
        </a>
      </span>
    </p>
  )
}

export default Footer

//         <span className='d-none d-sm-inline-block'>Rules</span>
