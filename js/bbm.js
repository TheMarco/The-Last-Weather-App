/*
* Copyright (c) 2012 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
*
* You may obtain a copy of the License at:
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/*global blackberry */

var bbm = {
	registered: false,

	/**
	* Registers this application with the blackberry.bbm.platform APIs.
	*
	* NOTE: This is NOT required for the invoke APIs.
	*/
	register: function () {
		blackberry.event.addEventListener('onaccesschanged', function (accessible, status) {
			if (status === 'unregistered') {
				blackberry.bbm.platform.register({
					uuid: '739ff5c5-20db-4f6a-849a-1572fc32cc1f'
				});
			} else if (status === 'allowed') {
				bbm.registered = accessible;
			}
			}, false);
		},
		inviteToDownload: function () {
			blackberry.bbm.platform.users.inviteToDownload();
		},
		save: function (personalMessage) {
			/* Update personal message. */
			blackberry.bbm.platform.self.setPersonalMessage(
				personalMessage,
				function (accepted) {
					/* Complete. */
					console.log(accepted);
				}
			);
		}
	};
	bbm.register();