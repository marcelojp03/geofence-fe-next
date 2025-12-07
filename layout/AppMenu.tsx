/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        {
            label: 'Principal',
            items: [
                { label: 'Monitoreo', icon: 'pi pi-fw pi-map', to: '/monitoring' }
            ]
        },
        {
            label: 'Gestión',
            items: [
                { label: 'Estudiantes', icon: 'pi pi-fw pi-users', to: '/children' },
                { label: 'Tutores', icon: 'pi pi-fw pi-user', to: '/parents' }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
