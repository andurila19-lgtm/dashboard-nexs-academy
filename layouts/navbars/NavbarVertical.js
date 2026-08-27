'use client'
// import node module libraries
import { Fragment, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { useMediaQuery } from 'react-responsive';
import {
	ListGroup,
	Card,
	Badge,
} from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

// import simple bar scrolling
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

// import routes file
import { DashboardMenu, PengajarMenu } from 'routes/DashboardRoutes';

// import auth context
import { useAuth } from 'context/AuthContext';

const NavbarVertical = (props) => {
	const location = usePathname()
	const { currentUser, isPengajar } = useAuth();

	// Use role-based menu
	const menuItems = isPengajar ? PengajarMenu : DashboardMenu;

	const CustomToggle = ({ children, eventKey, icon }) => {
		const { activeEventKey } = useContext(AccordionContext);
		const decoratedOnClick = useAccordionButton(eventKey, () =>
			console.log('totally custom!')
		);
		const isCurrentEventKey = activeEventKey === eventKey;
		return (
			<li className="nav-item">
				<Link
					href="#"
					className="nav-link "
					onClick={decoratedOnClick}
					data-bs-toggle="collapse"
					data-bs-target="#navDashboard"
					aria-expanded={isCurrentEventKey ? true : false}
					aria-controls="navDashboard">
					{icon ? <i className={`nav-icon fe fe-${icon} me-2`}></i> : ''}{' '}
					{children}
				</Link>
			</li>
		);
	};

	const generateLink = (item) => {
		return (
			(<Link
				href={item.link}
				className={`nav-link ${location === item.link ? 'active' : ''
					}`}
				onClick={(e) =>
					isMobile ? props.onClick(!props.showMenu) : props.showMenu
				}>

				{item.name}
				{''}
				{item.badge ? (
					<Badge
						className="ms-1"
						bg={item.badgecolor ? item.badgecolor : 'primary'}
					>
						{item.badge}
					</Badge>
				) : (
					''
				)}

			</Link>)
		);
	};

	const isMobile = useMediaQuery({ maxWidth: 767 });

	return (
		<Fragment>
			<SimpleBar style={{ maxHeight: '100vh' }}>
				<div className="nav-scroller">
					<Link href="/" className="navbar-brand">
						<span className="fw-bold fs-3 text-primary">NEXS</span>
						<span className="d-block text-muted" style={{ fontSize: '0.65rem', marginTop: '-4px' }}>Teaching Management</span>
					</Link>
				</div>
				{/* Dashboard Menu */}
				<Accordion defaultActiveKey="0" as="ul" className="navbar-nav flex-column">
					{menuItems.map(function (menu, index) {
						if (menu.grouptitle) {
							return (
								<Card bsPrefix="nav-item" key={index}>
									<div className="navbar-heading">{menu.title}</div>
								</Card>
							);
						} else {
							if (menu.children) {
								return (
									<Fragment key={index}>
										<CustomToggle eventKey={index} icon={menu.icon}>
											{menu.title}
											{menu.badge ? (
												<Badge className="ms-1" bg={menu.badgecolor ? menu.badgecolor : 'primary'}>
													{menu.badge}
												</Badge>
											) : ('')}
										</CustomToggle>
										<Accordion.Collapse eventKey={index} as="li" bsPrefix="nav-item">
											<ListGroup as="ul" bsPrefix="" className="nav flex-column">
												{menu.children.map(function (menuLevel1Item, menuLevel1Index) {
													return (
														<ListGroup.Item as="li" bsPrefix="nav-item" key={menuLevel1Index}>
															{generateLink(menuLevel1Item)}
														</ListGroup.Item>
													);
												})}
											</ListGroup>
										</Accordion.Collapse>
									</Fragment>
								);
							} else {
								return (
									<Card bsPrefix="nav-item" key={index}>
										<Link href={menu.link} className={`nav-link ${location === menu.link ? 'active' : ''}`}
											onClick={(e) =>
												isMobile ? props.onClick(!props.showMenu) : props.showMenu
											}>
											{typeof menu.icon === 'string' ? (
												<i className={`nav-icon fe fe-${menu.icon} me-2`}></i>
											) : (menu.icon)}
											{menu.title}
											{menu.badge ? (
												<Badge className="ms-1" bg={menu.badgecolor ? menu.badgecolor : 'primary'}>
													{menu.badge}
												</Badge>
											) : ('')}
										</Link>
									</Card>
								);
							}
						}
					})}
				</Accordion>
				{/* end of Dashboard Menu */}

			</SimpleBar>
		</Fragment>
	);
};

export default NavbarVertical;
