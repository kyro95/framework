import coreTypedocSidebar from './docs/api/core/typedoc-sidebar.cjs';
// import clientTypedocSidebar from './docs/api/client/typedoc-sidebar.cjs';

const sidebars = {
    apiSidebar: [
        {
            type: 'category',
            label: 'Core',
            link: {
                type: 'doc',
                id: 'api/core/index',
            },
            items: coreTypedocSidebar,
        },
        /*{
            type: 'category',
            label: 'Client',
            link: {
                type: 'doc',
                id: 'api/client/index',
            },
            items: clientTypedocSidebar,
        },*/
    ],
};

export default sidebars;
