(function() {
    'use strict';

    angular
        .module("phi.ui")
        .factory("phiBlockForm", phiBlockForm);


    phiBlockForm.$inject = ["phiApi"];
    function phiBlockForm(phiApi) {


        var fieldPreviewTemplate = '<div class="preview" ng-switch="field.type">' +

                                        '<div ng-switch-when="text">' +
                                            '<label ng-bind="field.title"></label>' +
                                            '<input ng-model="field.value" type="text" />' +
                                        '</div>' +

                                        '<div ng-switch-when="textarea">' +
                                            '<label ng-bind="field.title"></label>' +
                                            '<textarea ng-model="field.value"></textarea>' +
                                        '</div>' +

                                        '<div ng-switch-when="select">' +
                                            '<label ng-bind="field.title"></label>' +
                                            '<select ng-model="field.value">' +
                                                '<option value="">---</option>' +
                                                '<option ng-repeat="line in field.options | lines" value="{{line}}">{{line}}</option>' +
                                            '</select>' +
                                        '</div>' +

                                        '<div ng-switch-when="checkbox">' +
                                            '<input type="checkbox" ng-model="field.value">{{field.title}}</input>' +
                                        '</div>' +

                                        '<p class="notice" ng-bind="field.description"></p>' +

                                    '</div>';


        var formTemplate = '<form class="builder">' +
                                '<fieldset>' +
                                    '<phi-input multiline ng-model="form.description" label="descripci&oacute;n"></phi-input>' +
                                '</fieldset>' +

                                '<fieldset class="fields" sv-root sv-part="form.fields">' +

                                    '<div ng-repeat="field in form.fields" sv-element class="field">' +

                                        '<div class="toolbar" sv-handle>' +
                                            '<a phi-icon="fa-times" ng-click="vm.removeField(field)" href="">&nbsp;</a>' +
                                        '</div>' +

                                        '<div class="controls">' +
                                            '<phi-select label="tipo" ng-model="field.type">' +
                                                '<phi-option value="text">texto</phi-option>' +
                                                '<phi-option value="textarea">textarea</phi-option>' +
                                                '<phi-option value="select">lista</phi-option>' +
                                                '<phi-option value="checkbox">checkbox</phi-option>' +
                                            '</phi-select>' +
                                            '<phi-input label="titulo" ng-model="field.title"></phi-input>' +
                                            '<phi-input multiline label="descripci&oacute;n" ng-model="field.description"></phi-input>' +
                                            '<div ng-show="field.type == \'select\'">' +
                                                '<phi-input multiline label="opciones" ng-model="field.options"></phi-input>' +
                                                '<p class="notice">Escribe una opci&oacute;n por l&iacute;nea</p>' +
                                            '</div>' +
                                        '</div>' +

                                        fieldPreviewTemplate +

                                    '</div>' +

                                    '<button class="field-adder" phi-icon-left="fa-plus" ng-click="vm.addField()">Agregar campo</button>' +

                                '</fieldset>' +

                                '<footer>' +
                                    '<phi-button ng-click="vm.save()">guardar</phi-button>' +
                                    '<phi-button class="cancel" ng-click="vm.cancel()">cancelar</phi-button>' +
                                '</footer>' +
                            '</form>';



        var service = {

            type:        "form",
            title:       "Formulario",
            description: "",

            initialize: initializeController,

            actions: {

                default: {

                    template:   '<form class="face">' +

                                    '<p ng-bind="form.description"></p>' +

                                    '<div ng-show="!currentRecord">' +
                                        '<fieldset class="fields">' +
                                            '<div ng-repeat="field in form.fields">' +
                                                fieldPreviewTemplate +
                                            '</div>' +
                                        '</fieldset>' +

                                        '<div ng-show="!!vm.settings.recordsUrl">' +
                                            '<button ng-click="vm.submit()">Enviar</button>' +
                                        '</div>' +
                                    '</div>' +

                                    '<div ng-show="!!currentRecord">' +
                                        '<fieldset class="fields">' +
                                            '<div ng-repeat="field in form.fields">' +
                                                '<strong ng-bind="field.title"></strong>: <span ng-bind="currentRecord.values[field.name]"></span>' +
                                            '</div>' +
                                        '</fieldset>' +
                                    '</div>' +



                                '</form>',

                    controller: mainController,
                    controllerAs: "vm"

                },


                create: {

                    template:     formTemplate,
                    controller:   mainController,
                    controllerAs: "vm"
                },

                modify: {

                    template:     formTemplate,
                    controller:   mainController,
                    controllerAs: "vm"
                },

                remove: {

                    template:   '<div>' +
                                    '<h3>Eliminar este formulario ?</h3>' +
                                    '<button ng-click="vm.doDelete()">eliminar</button>' +
                                    '<button ng-click="vm.cancel()">cancelar</button>' +
                                '</div>',

                    controller:   mainController,
                    controllerAs: "vm"
                }

            }

        };

        return service;


        //////////////////



        initializeController.$inject = ["$scope", "phiBlockController"];
        function initializeController($scope, phiBlockController) {

            if ($scope.ngModel.url) {

                phiApi.get($scope.ngModel.url)
                    .success(function(response) {
                        $scope.form = response;
                        loadCurrentRecord($scope);
                    });

            } else {

                $scope.form = {
                    id: null,
                    fields: []
                };

                phiBlockController.openAction("create");

            }

        };


        function loadCurrentRecord($scope) {

            if ($scope.ngModel.settings.recordsUrl != undefined) {

                phiApi.get($scope.ngModel.settings.recordsUrl)
                    .success(function(response, code, headers) {
                        if (response.length > 0) {
                            $scope.currentRecord = response[0];
                        }
                    });

            }

        };


        mainController.$inject = ["$scope", "phiBlockController"];
        function mainController($scope, phiBlockController) {

            var vm         = this;

            vm.settings    = $scope.ngModel.settings;

            vm.addField    = addField;
            vm.removeField = removeField;

            vm.save        = save;
            vm.destroy     = destroy;
            vm.doDelete    = doDelete;
            vm.cancel      = cancel;

            vm.submit      = submit;

            //////////////


            function submit() {

                var entity = {};

                $scope.form.fields.map(function(field) {
                    entity[field.name] = field.value;
                });

                phiApi.post(vm.settings.recordsUrl, entity)
                    .success(function(response, code, headers) {
                        $scope.currentRecord = response;
                    });

            };

            function addField() {
                $scope.form.fields.push({
                    type: "text"
                });
            };

            function removeField(field) {
                if (confirm('Deseas eliminar este campo ?')) {
                    $scope.form.fields.splice($scope.form.fields.indexOf(field), 1)
                }
            };


            function save() {

                if (!$scope.ngModel.url) {

                    if (!$scope.ngModel.endpoint) {
                        //well, that was not configured properly
                        return;
                    }

                    phiApi.post($scope.ngModel.endpoint, $scope.form)
                        .success(function(response, code, headers) {
                            $scope.ngModel.url = headers("location");
                            phiBlockController.openAction("default");
                            phiBlockController.create();
                        });


                } else {

                    phiApi.put($scope.ngModel.url, $scope.form)
                        .success(function(response, code, headers) {
                            phiBlockController.openAction("default");
                        });

                }


            };

            function destroy() {
                phiBlockController.destroy();
            };

            function doDelete() {
                phiApi.remove($scope.ngModel.url)
                    .success(function(response, code, headers) {
                        vm.destroy();
                    });
            };

            function cancel() {

                if (!$scope.ngModel.url) {
                    vm.destroy();
                } else {
                    phiBlockController.openAction("default");
                }

            };

        };

    }

})();