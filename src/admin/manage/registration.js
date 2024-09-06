'use strict';

// Define a global `define` if it's not already defined
/* global define */

define(['jquery', 'socket', 'alerts', 'bootbox'], ($, socket, alerts, bootbox) => {
	const Registration = {};

	Registration.init = () => {
		$('.users-list').on('click', '[data-action]', function () {
			const parent = $(this).parents('[data-username]');
			const action = $(this).attr('data-action');
			const username = parent.attr('data-username');
			const method = action === 'accept' ? 'user.acceptRegistration' : 'user.rejectRegistration';

			socket.emit(method, { username }, (err) => {
				if (err) {
					return alerts.error(err);
				}
				parent.remove();
			});

			return false;
		});

		$('.invites-list').on('click', '[data-action]', function () {
			const parent = $(this).parents('[data-invitation-mail][data-invited-by]');
			const email = parent.attr('data-invitation-mail');
			const invitedBy = parent.attr('data-invited-by');
			const action = $(this).attr('data-action');
			const method = 'user.deleteInvitation';

			if (action === 'delete') {
				bootbox.confirm('[[admin/manage/registration:invitations.confirm-delete]]', (confirm) => {
					helper(confirm, email, invitedBy, method, () => {
						const nextRow = parent.next();
						const thisRowInvitedBy = parent.find('.invited-by');
						const nextRowInvitedBy = nextRow.find('.invited-by');

						if (nextRowInvitedBy.html() && nextRowInvitedBy.html().length < 2) {
							nextRowInvitedBy.html(thisRowInvitedBy.html());
						}

						parent.remove();
					});
				});
			}

			return false;
		});
	};

	return Registration;
});

function helper(confirm, email, invitedBy, method, removeRow) {
	if (confirm) {
		require(['socket', 'alerts'], (socket, alerts) => {
			socket.emit(method, { email, invitedBy }, (err) => {
				if (err) {
					return alerts.error(err);
				}
				removeRow();
			});
		});
	}
}
