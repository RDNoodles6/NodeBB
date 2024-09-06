'use strict';
define('admin/manage/registration', ['bootbox', 'alerts'], function (bootbox, alerts) {
	const Registration = {};

	const handleUserEmitResponse = function (parent, err) {
		if (err) {
			return alerts.error(err);
		}
		parent.remove();
	};

	const handleInvitationEmitResponse = function (parent, err) {
		if (err) {
			return alerts.error(err);
		}
		removeInvitationRow(parent);
	};

	const confirmAndDeleteInvitation = function (email, invitedBy, parent) {
		bootbox.confirm('[[admin/manage/registration:invitations.confirm-delete]]', function (confirm) {
			if (confirm) {
				socket.emit('user.deleteInvitation', { email: email, invitedBy: invitedBy }, function (err) {
					handleInvitationEmitResponse(parent, err);
				});
			}
		});
	};

	const removeInvitationRow = function (parent) {
		const nextRow = parent.next();
		const thisRowInvitedBy = parent.find('.invited-by');
		const nextRowInvitedBy = nextRow.find('.invited-by');

		if (nextRowInvitedBy.html() !== undefined && nextRowInvitedBy.html().length < 2) {
			nextRowInvitedBy.html(thisRowInvitedBy.html());
		}
		parent.remove();
	};

	const handleUserAction = function () {
		const parent = $(this).parents('[data-username]');
		const action = $(this).attr('data-action');
		const username = parent.attr('data-username');
		const method = action === 'accept' ? 'user.acceptRegistration' : 'user.rejectRegistration';

		socket.emit(method, { username: username }, function (err) {
			handleUserEmitResponse(parent, err);
		});
	};

	const handleInvitationAction = function () {
		const parent = $(this).parents('[data-invitation-mail][data-invited-by]');
		const email = parent.attr('data-invitation-mail');
		const invitedBy = parent.attr('data-invited-by');
		const action = $(this).attr('data-action');

		if (action === 'delete') {
			confirmAndDeleteInvitation(email, invitedBy, parent);
		}
	};

	Registration.init = function () {
		$('.users-list').on('click', '[data-action]', handleUserAction);
		$('.invites-list').on('click', '[data-action]', handleInvitationAction);
	};

	return Registration;
});