import { useQuery, gql } from '@apollo/client'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Popper from '@mui/material/Popper'
import classnames from 'classnames'
import * as R from 'ramda'
import React, { memo, useState, useEffect, useRef } from 'react'
import { Link as WLink, useRoute, useLocation } from 'wouter'
import ActionButton from '../buttons/ActionButton'
import { H4 } from '../typography'
import AddIconReverse from '../../styling/icons/button/add/white.svg?react'
import AddIcon from '../../styling/icons/button/add/zodiac.svg?react'
import Logo from '../../styling/icons/menu/logo.svg?react'
import NotificationIcon from '../../styling/icons/menu/notification.svg?react'

import NotificationCenter from '../NotificationCenter'
import AddMachine from '../../pages/AddMachine'

import styles from './Header.module.css'

const HAS_UNREAD = gql`
  query getUnread {
    hasUnreadNotifications
  }
`

const Link = ({
  setActive,
  isParent,
  className,
  activeClassName,
  item,
  ...props
}) => {
  const [location] = useLocation()
  const [isActive] = useRoute(props.to)
  const isParentActive = isParent && location.startsWith(props.to)
  if (isActive || isParentActive) setActive(item)

  const classNames = classnames({
    [className]: true,
    [activeClassName]: isActive || isParentActive,
  })

  return (
    <WLink {...props} asChild>
      <a className={classNames}>{props.children}</a>
    </WLink>
  )
}

const Subheader = ({ item, user }) => {
  const [prev, setPrev] = useState(null)

  return (
    <div className={styles.subheader}>
      <div className={styles.content}>
        <nav>
          <ul className={styles.subheaderUl}>
            {item.children.map((it, idx) => {
              if (!R.includes(user.role, it.allowedRoles)) return <></>
              return (
                <li key={idx} className={styles.subheaderLi}>
                  <Link
                    to={it.route}
                    state={{ prev }}
                    isParent={it.children?.length}
                    className={styles.subheaderLink}
                    activeClassName={styles.activeSubheaderLink}
                    item={it.route}
                    setActive={setPrev}>
                    {it.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}

const notNil = R.compose(R.not, R.isNil)

const Header = memo(({ tree, user, restrictionLevel }) => {
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifButtonCoords, setNotifButtonCoords] = useState({ x: 0, y: 0 })
  const [active, setActive] = useState()
  const [hasUnread, setHasUnread] = useState(false)

  const { data, refetch, startPolling, stopPolling } = useQuery(HAS_UNREAD)
  const notifCenterButtonRef = useRef()
  const popperRef = useRef()
  const [, navigate] = useLocation()

  useEffect(() => {
    if (data?.hasUnreadNotifications) return setHasUnread(true)
    // if not true, make sure it's false and not undefined
    if (notNil(data?.hasUnreadNotifications)) return setHasUnread(false)
  }, [data])

  useEffect(() => {
    startPolling(60000)
    return stopPolling
  })

  const bannerClassnames = classnames({
    [styles.smallBanner]: restrictionLevel === 1,
    [styles.bigBanner]: restrictionLevel === 2,
    ['bg-orange-400 w-full flex flex-col justify-center items-center text-white font-bold text-md']: true,
  })

  const onPaired = machine => {
    setOpen(false)
    navigate('/maintenance/machine-status', { state: { id: machine.deviceId } })
  }

  // these inline styles prevent scroll bubbling: when the user reaches the bottom of the notifications list and keeps scrolling,
  // the body scrolls, stealing the focus from the notification center, preventing the admin from scrolling the notifications back up
  // on the first scroll, needing to move the mouse to recapture the focus on the notification center
  // it also disables the scrollbars caused by the notification center's background to the right of the page, but keeps the scrolling on the body enabled
  const onClickAway = () => {
    setAnchorEl(null)
    document.querySelector('#root').classList.remove('root-notifcenter-open')
    document.querySelector('body').classList.remove('body-notifcenter-open')
  }

  const handleClick = event => {
    const coords = notifCenterButtonRef.current.getBoundingClientRect()
    setNotifButtonCoords({ x: coords.x, y: coords.y + 5 })

    setAnchorEl(anchorEl ? null : event.currentTarget)
    document.querySelector('#root').classList.add('root-notifcenter-open')
    document.querySelector('body').classList.add('body-notifcenter-open')
  }

  const popperOpen = Boolean(anchorEl)
  const id = popperOpen ? 'notifications-popper' : undefined
  return (
    <header className={styles.headerContainer}>
      <div className={styles.header}>
        <div className={styles.content}>
          <div
            onClick={() => {
              setActive(false)
              navigate('/dashboard')
            }}
            className={classnames(styles.logo, styles.logoLink)}>
            <Logo />
            <H4 className="text-white">Lamassu Admin</H4>
          </div>
          <nav className={styles.nav}>
            <ul className={styles.ul}>
              {tree.map((it, idx) => {
                if (!R.includes(user.role, it.allowedRoles)) return <></>
                return (
                  <Link
                    isParent
                    key={idx}
                    to={it.route || it.children[0].route}
                    setActive={setActive}
                    item={it}
                    className={styles.link}
                    activeClassName={styles.activeLink}>
                    <li className={styles.li}>
                      <span
                        className={styles.forceSize}
                        data-forcesize={it.label}>
                        {it.label}
                      </span>
                    </li>
                  </Link>
                )
              })}
            </ul>
          </nav>
          <div className={styles.actionButtonsContainer}>
            <ActionButton
              altTextColor
              color="secondary"
              Icon={AddIcon}
              InverseIcon={AddIconReverse}
              onClick={() => setOpen(true)}>
              Add machine
            </ActionButton>
            <ClickAwayListener onClickAway={onClickAway}>
              <div ref={notifCenterButtonRef}>
                <button
                  onClick={handleClick}
                  className={styles.notificationIcon}>
                  <NotificationIcon />
                  {hasUnread && <div className={styles.hasUnread} />}
                </button>
                <Popper
                  ref={popperRef}
                  id={id}
                  open={popperOpen}
                  anchorEl={anchorEl}
                  className={styles.popper}
                  disablePortal={false}
                  placement="bottom-end"
                  modifiers={[
                    {
                      name: 'offset',
                      enabled: true,
                      options: {
                        offset: ['100vw', '100vw'],
                      },
                    },
                    {
                      name: 'preventOverflow',
                      enabled: true,
                      options: {
                        rootBoundary: 'viewport',
                      },
                    },
                  ]}>
                  <NotificationCenter
                    popperRef={popperRef}
                    buttonCoords={notifButtonCoords}
                    close={onClickAway}
                    hasUnreadProp={hasUnread}
                    refetchHasUnreadHeader={refetch}
                  />
                </Popper>
              </div>
            </ClickAwayListener>
          </div>
        </div>
      </div>
      {active && active.children && <Subheader item={active} user={user} />}
      {restrictionLevel > 0 && (
        <div className={bannerClassnames}>
          <p className="m-0">
            The software you're running is out of license. Please contact us to
            ensure your OSA payments are current.
          </p>
          <p className="m-0">
            Future restrictions may be applied. If this is in error, please get
            in touch with support@lamassu.is.
          </p>
        </div>
      )}
      {open && <AddMachine close={() => setOpen(false)} onPaired={onPaired} />}
    </header>
  )
})

export default Header
