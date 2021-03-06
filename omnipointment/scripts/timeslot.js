//BROWERSIFY IMPORTS
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var _ = require('underscore');
//LOCAL IMPORTS
import {Database} from './database';

export var TimeSlotModel = Backbone.Model.extend({
	defaults: {
		time: 0,
		duration: 15,
		uid: '',
		mid: '',
		free: 0,
		meeting: null
	},
	initialize: function(){

	},
	getAttributes: function(){
		return _.extend(this.attributes);
	},
	saveResponse: function(){
		var slotUID = this.get('uid');
		var meetingModel = this.get('meeting');
		var timeSlotData = _.clone(this.attributes);
			timeSlotData.meeting = null;
		var promise = Database.postTimeSlot(
			this.get('uid'),
			this.get('mid'),
			timeSlotData
		);
		promise.then(function(data){
			if(data.userIsNew){
				var userList = _.clone(meetingModel.get('users'));
				if(userList.indexOf(slotUID) < 0){
					userList.push(slotUID);
				}
				meetingModel.set({
					users: userList
				}, {silent: true});
			}
		});
	}
});

export var TimeSlotView = Backbone.View.extend({
	template: function(attributes){
		var html = this.renderSlot(attributes);
		var templateFunction = _.template(html);
		return templateFunction(attributes);
	},
	events: {
		'click': 'toggleFree'
	},
	initialize: function(){
		this.listenTo(this.model, "change", this.render);
		this.render();
	},
	render: function(){
		this.$el.html(this.template(_.extend(this.model.getAttributes())));
		return this;
	},
	renderSlot: function(attributes){
		var html = '';
			var classList = "toggle-time-slot" + (attributes.free === 2 ? " free-slot" : " busy-slot");
			html += `<button id="toggle-${attributes.time}" class="${classList}">`;
			html += `${attributes.free === 2 ? "&#10004;" : "X"}`;
			html += `</button>`;
		return html;
	},
	toggleFree: function(){
		this.model.set({
			free: this.model.get('free') === 2 ? 0 : 2
		});
		this.model.saveResponse();
	}
});