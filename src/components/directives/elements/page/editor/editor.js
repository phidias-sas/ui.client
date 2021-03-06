/*

page = {

    id: "15913gfq",
    url: "nodes/9xaib1v/posts/process/15913gfq",

    title: "A title",
    description: "Yes, a description",

    blocks: [
        {
            type: "html",
            allowed: ["modify", "delete"],
            url: "nodes/9xaib1v/media/html/1591chpq",
            id: "1591cimg"
        },

        {
            type: "form",
            allowed: ["modify", "delete"],
            url: "data/entities/1591x70r",
            id: "1591x8p9"
        },

        {
            type: "html",
            allowed: ["modify", "delete"],
            url: "nodes/9xaib1v/media/html/15s1ibga",
            id: "15s1idb4"
        }
    ]           
};


insertable = [
    {
        type: "html",
        label: "texto HTML",
        icon: "fa-text",

        endpoint: "nodes/9xaib1v/media/html"
    },

    {
        type: "video",
        label: "YouTube",
        icon: "fa-video",

        endpoint: "nodes/9xaib1v/media/videos"
    },

    {
        type: "form",
        label: "Formulario",
        icon: "fa-form",        

        endpoint: "nodes/9xaib1v/data/entities"
    }
];


<phi-page-editor ng-model="page" insertable="insertable"></phi-page-editor>

*/


(function() {

    angular
        .module("phi.ui")
        .directive("phiPageEditor", phiPageEditor);


    function phiPageEditor() {

        return {

            restrict: "E",

            scope: {
                page:       "=ngModel",
                insertable: "="
            },

            controller:       phiPageEditorController,
            controllerAs:     "vm",
            bindToController: true,

            template:   '<div>' + 

                            '<div sv-root sv-part="vm.page.blocks" sv-on-sort="vm.reorder()">' + 

                                '<div ng-repeat="(key, block) in vm.page.blocks" ng-init="block.ctrl = {}" class="phi-page-editor-block" sv-element>' + 

                                    '<div class="phi-page-editor-block-toolbar" sv-handle>' + 

                                        '<div class="phi-page-editor-block-toolbar-menu">' + 
                                            '<phi-button class="cancel" ng-blur="block.menuShown = false" id="menu_toggler_{{post.id}}_{{key}}" ng-show="block.ctrl.currentState == \'default\'" ng-click="block.menuShown = !block.menuShown" phi-icon="fa-ellipsis-v"></phi-button>' + 
                                            '<phi-button class="cancel" ng-blur="block.menuShown = false" ng-show="block.ctrl.currentState != \'default\'" ng-click="block.ctrl.go(\'default\')" phi-icon="fa-arrow-left"></phi-button>' + 

                                            '<div phi-tooltip-for="menu_toggler_{{post.id}}_{{key}}" phi-tooltip-origin="top right" phi-tooltip-align="bottom right" phi-visible="{{block.menuShown}}" phi-visible-animation="slide-bottom">' +
                                                '<phi-menu phi-texture="paper">' +
                                                    '<phi-menu-item ng-repeat="item in block.menu" phi-icon-left="{{item.icon}}" ng-click="block.ctrl.go(item.state)">{{item.title}}</phi-menu-item>' +
                                                '</phi-menu>' +
                                            '</div>' +
                                        '</div>' + 

                                    '</div>' + 

                                    '<phi-object ' + 
                                        'type="page-block-{{block.type}}"' + 
                                        'ng-model="block" ' + 
                                        'controller-as="block.ctrl"' + 
                                        'on-change="vm.attachBlock(block)"' + 
                                        'on-destroy="vm.removeBlock(block)"' + 
                                    '>' + 
                                    '</phi-object>' + 

                                '</div>' + 

                            '</div>' + 


                            '<div class="phi-page-editor-inserter phi-drawer" phi-texture="paper">' + 
                                '<div phi-visible="{{!!adderIsOpen}}" phi-visible-animation="scale">' + 
                                    '<phi-menu>' + 
                                        '<phi-menu-item ng-repeat="insertable in vm.insertable" ng-click="$parent.adderIsOpen = false; vm.addBlock(insertable);" phi-icon-left="{{insertable.icon}}">{{insertable.title}}</phi-menu-item>' + 
                                    '</phi-menu>' + 
                                '</div>' + 
                                '<button ng-click="adderIsOpen = true" ng-show="!adderIsOpen" phi-icon-left="fa-plus">adjuntar</button>' + 
                                '<button ng-click="adderIsOpen = false" ng-show="adderIsOpen" phi-icon-left="fa-times" class="cancel">cancelar</button>' + 
                            '</div>' + 

                        '</div>'

        };


        phiPageEditorController.$inject = ["phiApi"];
        function phiPageEditorController(phiApi) {

            var vm         = this;

            vm.addBlock    = addBlock;
            vm.attachBlock = attachBlock;
            vm.removeBlock = removeBlock;
            vm.reorder     = reorder;

            ///////////////////////

            function addBlock(insertable) {

                if (!vm.page.blocks) {
                    vm.page.blocks = [];
                }

                var newBlock   = insertable.block;
                newBlock.type  = insertable.type;
                newBlock.order = vm.page.blocks.length;

                vm.page.blocks.push(newBlock);

            };

            function attachBlock(block) {

                if (block.id) {

                    phiApi.put( vm.page.url + "/blocks/" + block.id, block);

                } else {

                    phiApi.post( vm.page.url + "/blocks", {

                        type:        block.type,
                        url:         block.url,
                        title:       block.title,
                        description: block.description,
                        order:       vm.page.blocks.length

                    }).success( function(response) {
                        block.id = response.id;
                    });

                }

            };

            function removeBlock(block) {

                if (block.id) {

                    phiApi.remove(vm.page.url + "/blocks/" + block.id)
                        .success(function() {
                            vm.page.blocks.splice(vm.page.blocks.indexOf(block), 1);
                        });

                } else {
                    vm.page.blocks.splice(vm.page.blocks.indexOf(block), 1);
                }

            };

            function reorder() {
                var blockIds = [];
                for (var cont = 0; cont < vm.page.blocks.length; cont++) {
                    blockIds.push(vm.page.blocks[cont].id);
                }
                phiApi.put(vm.page.url+"/blocks/", blockIds);
            };


        };


    };


})();