// import node module libraries
import Link from 'next/link';
import { Fragment } from 'react';
import { useMediaQuery } from 'react-responsive';
import {
    ListGroup,
    Dropdown,
} from 'react-bootstrap';

// import hooks
import useMounted from 'hooks/useMounted';

// import auth
import { useAuth } from 'context/AuthContext';

const QuickMenu = () => {

    const hasMounted = useMounted();
    const { currentUser, logout } = useAuth();
    
    const isDesktop = useMediaQuery({
        query: '(min-width: 1224px)'
    })

    const handleLogout = () => {
        logout();
        window.location.href = '/authentication/sign-in';
    };

    const UserDropdown = ({ showAlways }) => {
        return (
            <Dropdown as="li" className="ms-2">
                <Dropdown.Toggle
                    as="a"
                    bsPrefix=' '
                    className="rounded-circle"
                    id="dropdownUser">
                    <div className="avatar avatar-md avatar-indicators avatar-online">
                        <div className="avatar-initials rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px', fontSize: '14px'}}>
                            {currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                        </div>
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu
                    className="dropdown-menu dropdown-menu-end"
                    align="end"
                    aria-labelledby="dropdownUser"
                    {...(showAlways ? { show: true } : {})}
                    >
                    <Dropdown.Item as="div" className="px-4 pb-0 pt-2" bsPrefix=' '>
                            <div className="lh-1 ">
                                <h5 className="mb-1">{currentUser?.name || 'User'}</h5>
                                <p className="text-muted fs-6 mb-0">{currentUser?.role === 'admin' ? 'Administrator' : 'Pengajar'}</p>
                            </div>
                            <div className=" dropdown-divider mt-3 mb-2"></div>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>
                        <i className="fe fe-power me-2"></i>Keluar
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    };

    return (
        <Fragment>
            <ListGroup as="ul" bsPrefix='navbar-nav' className="navbar-right-wrap ms-auto d-flex nav-top-wrap">
                <UserDropdown showAlways={hasMounted && isDesktop} />
            </ListGroup>
        </Fragment>
    )
}

export default QuickMenu;