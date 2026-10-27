import React from 'react'
import Logo from '../assets/logo.jfif'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-primary">
     <Link to="/">
     <img src={Logo} alt="logo" className="mx-2" style={{ width: '50px', height: '50px' }} />
     </Link>
  <div className="container-fluid">
    <Link className="navbar-brand text-white" to="/">RateKr</Link>
  </div>
</nav>
    </div>
  )
}

export default Navbar
