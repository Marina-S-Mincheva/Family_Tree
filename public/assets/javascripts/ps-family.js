var familyArray = [];
var isDialogOpen = false;
var self = undefined;
var isFamilyEmpty = true;

var deleteTree = function() {
    self.deleteTreeFunc();
};

(function($) {
    $.fn.ft_family = function(options) {
        var familyObj = new theFamily(options);
        familyObj.rootDiv = this;
        if (familyObj.rootDiv === null) {
            jQuery.error('wrong id given');
            return;
        }
        familyObj.init();
        return familyObj;
    }
    var theFamily = function(options) {
        this.rootDiv = '';
        this.treeGround = null;
        this.family = [];
        this.options_menu = null;
        this.referenceVar = '';
        this.selectedMember = null;
        this.memberFormID = 'ftMemberForm';
        this.oldestMemberId = 0;
        this.addBreadingGround();
        if (options.referenceVar) {
            this.referenceVar = options.referenceVar;
        }
        return this;
    }
    theFamily.prototype = {
        constructor: theFamily,

        //Synchronizing localStorage and familyArray
        synchronize: function(toFromLocalStorage) {
            if (toFromLocalStorage === 'to') {
                window.localStorage.setItem('familyArray', JSON.stringify(this.family));
            }
            if (toFromLocalStorage === 'from') {
                this.family = JSON.parse(window.localStorage.getItem('familyArray'));
            }
        },
        init: function() {
            self = this;
            this.createOptionsMenu();
            this.addBreadingGround();
            this.createNewMemberForm();
            if (serverTree !== undefined) { // on login take tree from DB
                var tree = serverTree;
                if (tree.length > 0) {
                    this.family = tree.slice();
                    this.synchronize('to');
                    $("#startForm").css("display", "none");
                }
            }
            if (familyArray.length > 0) { // on changing pages take tree from window.familyArray
                this.family = familyArray.slice();
                $("#startForm").css("display", "none");
            } else { // on reloading page take tree from local storage
                if (this.family.length === 0) { // on login do NOT take tree from local storage
                    this.synchronize('from');
                    // console.log('family from local storage ', this.family);
                }
            }
            if (this.family.length > 0) { // if family already exist then render it
                this.refreshFamily();
                $("#startForm").css("display", "none");
                $("#saveTree").css("display", "inline-block");
                $("#deleteTree").css("display", "inline-block");
                $("#printTree").css("display", "inline-block");
                $("#backToMyTree").css("display", "none");
            } else {
                $("#startForm").css("display", "inline-block");
                $("#saveTree").css("display", "none");
                $("#deleteTree").css("display", "none");
                $("#backToMyTree").css("display", "none");
                $("#printTree").css("display", "none");
                // show first memeber form
                // this.openMemberForm(true);
            }
        },
        refreshFamily: function() {
            // console.log("family BEFORE DB ", this.family);
            this.oldestMemberId = this.getOldestMemberId(0);
            // console.log(this.oldestMemberId);
            var html = "<ul>" + this.renderFamily(this.family[this.oldestMemberId]) + "</ul>";
            $(this.treeGround).html(html);
        },
        getOldestMemberId: function(memberIndex) {
            var parentId = undefined;
            if (this.family[memberIndex].father) {
                parentId = this.family[memberIndex].father;
            } else if (this.family[memberIndex].mother) {
                parentId = this.family[memberIndex].mother;
            }
            if (parentId !== undefined) {
                if (this.family[parentId].child && this.family[parentId].child.length > 0) {
                    return this.getOldestMemberId(parentId);
                }
            }
            return this.family[memberIndex].id;
        },
        createOptionsMenu: function() {
            var div = $('<div>').attr('id', 'ft-popmenu');
            var ul = $('<ul>');
            var root = this;
            // add member button
            var liAdd = $('<li>').html('Add Member').appendTo(ul);
            liAdd.click(function(event) {
                root.openMemberForm(true);
                $(root.options_menu).css('display', 'none');
            });
            // view member button
            var liDisplay = $('<li>').html('View Profile').appendTo(ul);
            liDisplay.click(function(event) {
                root.openMemberForm(false);
                $(root.options_menu).css('display', 'none');
            });
            // remove member
            // ************************************************************
            var liRemove = $('<li>').html('Clear Member').appendTo(ul);
            liRemove.click(function(event) {
                root.removeMember(this);
                $(root.options_menu).css('display', 'none');
            });
            // ************************************************************
            // cancel the pop menu
            var liCancel = $('<li>').html('Cancel').appendTo(ul);
            liCancel.click(function(event) {
                $(root.options_menu).hide();
            });
            $(div).append(ul);
            this.options_menu = div;
            $(this.options_menu).appendTo(this.rootDiv);
        },
        openMemberForm: function(isNewMember) {
            if (!isNewMember) {
                $('#ft-isediting').val(1);
                $('#profilePic').prepend('<img id="profPic" src="' + this.selectedMember.pic + '" />');
                $('#ft-name').val(this.selectedMember.name);
                var gender = 'Male';
                if (this.selectedMember.gender === 'F') {
                    gender = 'Female';
                }
                $('#ft-gender').val(gender);
                $('#ft-age').val(this.selectedMember.age);
                $('#fbProfile').val(this.selectedMember.fbProfile);
                $('#ft-relation').parent().parent().hide();
            } else {
                $('#ft-isediting').val(0);
                $('#ft-relation').parent().parent().show();
            }
            $("#" + this.memberFormID).dialog({ width: 482, show: { effect: "fold", duration: 900 } });
            isDialogOpen = true;
        },
        addBreadingGround: function() {
            var member = $('<div>').attr('id', 'treeGround');
            $(member).attr('class', 'tree-ground');
            $(member).appendTo(this.rootDiv);
            this.treeGround = member;
            $(this.treeGround).draggable();
        },
        renderFamily: function(member) {
            if (typeof member === "undefined" || member.length <= 0) {
                return;
            }
            html = "<li>";
            html = html + this.getMemberHTML(member, false);
            if (member.spouse) {
                html = html + this.getMemberHTML(this.family[member.spouse], true);
            }
            if (member.child) {
                html = html + '<ul>';
                for (var index = 0; index < member.child.length; index++) {
                    html = html + this.renderFamily(this.family[member.child[index]]);
                }
                html = html + '</ul>';
            }
            html = html + "</li>";
            return html;
        },
        getMemberHTML: function(member, isSpouse) {
            var classHTML = "";
            if (isSpouse) {
                classHTML = ' class="single-member spouse" ';
            } else {
                classHTML = ' class="single-member" ';
            }
            var html = '<a href="javascript:void(0)" data-id="' + member.id + '" data-name="' + member.name + '" data-gender="' + member.gender + '" data-age="' + member.age + '" data-relation="" ' + classHTML + ' onclick="' + this.referenceVar + '.openMenu(this,event)"><span class="fa fa-close" onclick="' + this.referenceVar + '.removeMember(this)"></span><center><img id="member-picture-' + member.id + '" src="' + member.pic + '"><br><span>' + member.name.slice(0, 5) + ' (' + member.gender.slice(0, 1) + ')</span></center></a>';
            return html;
        },
        readImage: function(input, memberId) {
            var files = $(input).prop('files');
            var root = this;
            if (files && files[0]) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    root.family[memberId].pic = e.target.result;
                    $('#member-picture-' + memberId).attr('src', e.target.result);
                }

                reader.readAsDataURL(files[0]);
            }
        },
        removeMember: function(element) {
            this.selectedMember.name = '';
            this.selectedMember.pic = './assets/images/question.png';
            this.selectedMember.age = '';
            this.selectedMember.fbProfile = '';
            // this.family[memberId].name = '';
            // this.family[memberId].name = '';
            this.selectedMember.gender = '';
            this.refreshFamily();
        },
        addMember: function(member, to, relation) {
            this.family.push(member);
            var newMemberID = this.family.length - 1;
            this.family[newMemberID].id = newMemberID;
            if (to !== undefined) {
                if (relation === 'child') {
                    if (this.family[to][relation] === undefined) {
                        this.family[to][relation] = [];
                    }
                    this.family[to][relation].push(newMemberID);
                } else {
                    this.family[to][relation] = newMemberID;
                }
                // if father then addin siblings to father child
                if (relation === 'father') {
                    if (this.family[to].mother !== undefined) {
                        // if mother exist
                        var motherID = this.family[to].mother;
                        this.family[motherID].spouse = newMemberID;
                        var child = [];
                        child.push(to);
                        this.family[newMemberID]['child'] = child;
                    } else {
                        //         // if no mother exist
                        var child = [];
                        child.push(to);
                        this.family[newMemberID]['child'] = child;
                    }
                }
                if (relation === 'mother') {
                    if (this.family[to].father !== undefined) {
                        // if father already exist
                        var fatherID = this.family[to].father;
                        this.family[fatherID].spouse = newMemberID;
                        this.family[newMemberID].spouse = fatherID;
                        var child = [];
                        child.push(to);
                        this.family[newMemberID]['child'] = child;
                    } else {
                        //         // if no father exist
                        var child = [];
                        child.push(to);
                        this.family[newMemberID]['child'] = child;
                    }
                }
                if (relation === 'child') {
                    if (this.family[to].gender === 'M') {
                        this.family[newMemberID].father = to;
                        var motherID = this.family[to].spouse;
                        this.family[newMemberID].mother = motherID;
                        if (motherID !== undefined) {
                            if (this.family[motherID].child === undefined) {
                                this.family[motherID].child = [];
                            }
                            this.family[motherID].child.push(newMemberID);
                        }
                    } else {
                        this.family[newMemberID].mother = to;
                        var fatherID = this.family[to].spouse;
                        this.family[newMemberID].father = fatherID;
                        if (fatherID !== undefined) {
                            if (this.family[fatherID].child === undefined) {
                                this.family[fatherID].child = [];
                            }
                            this.family[fatherID].child.push(newMemberID);
                        }
                    }
                }
                if (relation === 'spouse') {
                    this.family[newMemberID].spouse = to;
                    if (this.family[to].child !== undefined) {
                        this.family[newMemberID].child = [];
                        var spouseKids = this.family[to].child;
                        this.family[newMemberID].child = spouseKids.slice();
                        if (this.family[to].gender === 'M') {
                            for (var index = 0; index < this.family.length; index++) {
                                if (spouseKids.indexOf(index) !== -1) {
                                    this.family[index].mother = newMemberID;
                                }
                            }
                        } else {
                            for (var index = 0; index < this.family.length; index++) {
                                if (spouseKids.indexOf(index) !== -1) {
                                    this.family[index].father = newMemberID;
                                }
                            }
                        }
                    }
                }
            }
            return newMemberID;
        },
        createNewMemberForm: function() {
            var html = '';
            html = '<div id="' + this.memberFormID + '" title="Family Member Detail"><p>';
            html = html + '<div id="profilePic"></div>';
            html = html + '<table>';
            html = html + '<tr><td><label>Name</label></td><td><input type="text" value="" id="ft-name"/></td></tr>';
            html = html + '<tr><td><label>Gender</label></td><td><select id="ft-gender"><option value="Female" selected="selected">Female</option><option value="Male">Male</option></select></td></tr>';
            html = html + '<tr><td><label>Age</label></td><td><input type="text" value="" id="ft-age"></td></tr>';
            html = html + '<tr><td class="relations"><label>Relation</label></td><td class="relations"><select id="ft-relation"><option value="mother">First Member</option><option value="child">Child</option><option value="spouse">Spouse</option></select></td></tr>';
            html = html + '<tr><td><label>Facebook</label></td><td><input type="text" value="" id="fbProfile"></td></tr>';;
            html = html + '<tr><td><label>Photo</label></td><td><input type="file" id="ft-picture"></td></tr>';
            html = html + '<tr><td>&nbsp;</td><td><input type="hidden" value="0" id="ft-isediting"/><input id="saveButt" type="button" value="Save" onclick="' + this.referenceVar + '.saveMember()"/><input id="closeButt" type="button" value="Close" onclick="' + this.referenceVar + '.closeProfile()"/></td></tr>';
            html = html + '</table>';
            html = html + '</p></div>';
            $(this.rootDiv).append(html);
        },
        closeProfile: function() {
            $('#profilePic').children("img").remove();
            // $("#" + this.memberFormID).dialog("close");
            // $("#ftMemberForm").dialog("close");
            $(".ui-dialog-content").dialog("close");
            isDialogOpen = false;

        },
        saveMember: function() {
            var member = { id: -1, name: "", gender: "", age: "", fbProfile: "", pic: "" };
            if ($('#ft-isediting').val() === '1') {
                member = this.selectedMember;
                member.name = $('#ft-name').val();
                member.gender = $('#ft-gender').val();
                member.age = $('#ft-age').val();
                member.fbProfile = $('#fbProfile').val();
                this.family[member.id] = member;
                var memberID = member.id;
                this.readImage($('#ft-picture'), memberID);
            } else {
                member.name = $('#ft-name').val();
                member.gender = $('#ft-gender').val();
                member.age = $('#ft-age').val();
                member.fbProfile = $('#fbProfile').val();
                if (member.gender === 'Female') {
                    member.gender = 'F';
                    member.pic = './assets/images/profile-f.png';
                } else {
                    member.gender = 'M';
                    member.pic = './assets/images/profile.png';
                }
                var parentId = 0;
                var relation = "";
                if (this.selectedMember != null) {
                    parentId = this.selectedMember.id;
                    relation = $('#ft-relation').val();
                }
                var newMemberID = this.addMember(member, parentId, relation);
                this.readImage($('#ft-picture'), newMemberID);
            }
            $('#ft-name').val("");
            $('#ft-gender').val("Male");
            $('#ft-age').val("");
            $('#fbProfile').val("");
            $('#ft-isediting').val("0");
            familyArray = this.family.slice();
            this.synchronize('to');
            this.refreshFamily();
            $('#profilePic').children("img").remove();
            $(".ui-dialog-content").dialog("close");
            isDialogOpen = false;
            isFamilyEmpty = false;
            $("#startForm").css("display", "none");
            $("#saveTree").css("display", "inline-block");
            $("#deleteTree").css("display", "inline-block");
            $("#printTree").css("display", "inline-block");
        },
        openMenu: function(element, event) {
            this.selectedMember = this.family[$(element).attr('data-id')];
            $(this.options_menu).css('left', event.clientX);
            $(this.options_menu).css('top', event.clientY);
            $(this.options_menu).show();
        },
        deleteTreeFunc: function() {
            this.family = [];
            this.synchronize('to');
            isFamilyEmpty = true;
            $("#treeGround").html("");
            $("#startForm").css("display", "inline-block");
            $("#saveTree").css("display", "none");
            $("#deleteTree").css("display", "none");
            $("#printTree").css("display", "none");
        }
    }
}(jQuery));