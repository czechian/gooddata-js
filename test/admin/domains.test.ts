// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import 'isomorphic-fetch';
import * as fetchMock from 'fetch-mock';
import { DomainsModule } from '../../src/admin/domains';
import { XhrModule } from '../../src/xhr';

const createDomains = () => new DomainsModule(new XhrModule(fetch, {}));

describe('project', () => {
    describe('with fake server', () => {
        afterEach(() => {
            fetchMock.restore();
        });

        describe('getDomain', () => {
            it('should reject with 400 when domain resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId',
                    400
                );

                return createDomains()
                    .getDomain('contractId', 'domainId', null)
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });

            it('should return domain', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId',
                    {
                        status: 200,
                        body: {
                            domain: {
                                name: 'domainId',
                                hostname: 'domainId.intgdc.com',
                                environment: 'TESTING',
                                links: {
                                    self: '/gdc/admin/contracts/contractId/domains/domainId',
                                    users: '/gdc/admin/contracts/contractId/domains/domainId/users',
                                    projects: '/gdc/admin/contracts/contractId/domains/domainId/projects'
                                }
                            }
                        }
                    }
                );

                return createDomains().getDomain('contractId', 'domainId', null).then((result: any) => {
                    expect(result.name).toBe('domainId');
                    expect(result.id).toBe('domainId');
                    expect(result.contractId).toBe('contractId');
                });
            });
        });

        describe('getDomains', () => {
            it('should reject with 400 when domains resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId',
                    400
                );

                return createDomains()
                    .getDomain('contractId', 'domainId', null)
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });

            it('should return domains', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains',
                    {
                        status: 200,
                        body: {
                            domains: {
                                items: [
                                    {
                                        domain: {
                                            name: 'data-admin-test1',
                                            hostname: 'data-admin-test1-stg3.intgdc.com',
                                            environment: 'TESTING',
                                            links: {
                                                self: '/gdc/admin/contracts/contractId/domains/data-admin-test1',
                                                users: '/gdc/admin/contracts/contractId/domains/data-admin-test1/users',
                                                projects: '/gdc/admin/contracts/contractId/domains/data-admin-test1/projects' // tslint:disable-line:max-line-length
                                            }
                                        }
                                    },
                                    {
                                        domain: {
                                            name: 'data-admin-test2',
                                            hostname: 'data-admin-test2-stg3.intgdc.com',
                                            environment: 'TESTING',
                                            links: {
                                                self: '/gdc/admin/contracts/contractId/domains/data-admin-test2',
                                                users: '/gdc/admin/contracts/contractId/domains/data-admin-test2/users',
                                                projects: '/gdc/admin/contracts/contractId/domains/data-admin-test2/projects' // tslint:disable-line:max-line-length
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                );

                return createDomains().getDomains('contractId', null).then((result: any) => {
                    expect(result.items.length).toBe(2);
                    expect(result.items[0].id).toBe('data-admin-test1');
                    expect(result.items[1].id).toBe('data-admin-test2');
                });
            });
        });

        describe('getDomainProjects', () => {
            it('should reject with 400 when projects resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/projects',
                    400
                );

                return createDomains()
                    .getDomainProjects('contractId', 'domainId', null, null, null)
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });

            it('should return domains projects', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/projects',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainProjects: {
                                items: [{ project: { title: 'project0' } }, { project: { title: 'project1' } }],
                                paging: {}
                            }
                        })
                    }
                );

                return createDomains()
                    .getDomainProjects('contractId', 'domainId', null, null, null)
                    .then((result: any) => {
                        expect(result.items.length).toBe(2);
                        expect(result.items[0].title).toBe('project0');
                    });
            });

            it('should return empty domains projects', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/projects',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainProjects: {
                                items: [{ project: { title: 'project0' } }, { project: { title: 'project1' } }],
                                paging: {}
                            }
                        })
                    }
                );

                return createDomains()
                    .getDomainProjects('contractId', 'domainId', null, null, { next: null })
                    .then((result: any) => {
                        expect(result.items.length).toBe(0);
                    });
            });

            it('should return disabled domain projects', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/projects?state=disabled',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainProjects: {
                                items: [{ project: { title: 'project0' } }, { project: { title: 'project1' } }],
                                paging: {}
                            }
                        })
                    }
                );

                return createDomains()
                    .getDomainProjects('contractId', 'domainId', 'disabled', null, { next: null })
                    .then((result: any) => {
                        expect(result.items.length).toBe(0);
                    });
            });

            it('should use paging next when getting result', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/projects?limit=10',
                    {
                        status: 200,
                        body: JSON.stringify({
                            domainProjects: {
                                items: [{ project: { title: 'project0' } }, { project: { title: 'project1' } }],
                                paging: {}
                            }
                        })
                    }
                );

                return createDomains()
                    .getDomainProjects(
                        'contractId',
                        'domainId',
                        null,
                        null,
                        { next: '/gdc/admin/contracts/contractId/domains/domainId/projects?limit=10' }
                    )
                    .then((result: any) => {
                        expect(result.items.length).toBe(2);
                        expect(result.items[0].title).toBe('project0');
                    });
            });
        });

        describe('getDomainUsers', () => {
            const usersPayload = JSON.stringify({
                domainUsers: {
                    items: [
                        { user: {
                            login: 'joe@foo.com',
                            firstName: 'joe',
                            lastName: 'black',
                            links: { domain: '/gdc/admin/contracts/contractId/domains/domainId/users' }
                        } },
                        { user: {
                            login: 'noe@foo.com',
                            firstName: 'noe',
                            lastName: 'red',
                            links: { domain: '/gdc/admin/contracts/contractId/domains/domainId/users' }
                        } }
                    ],
                    paging: {}
                }
            });

            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/users',
                    400
                );

                return createDomains()
                    .getDomainUsers('contractId', 'domainId', null, null)
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });

            it('should return domain users', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/users',
                    {
                        status: 200,
                        body: usersPayload
                    }
                );

                return createDomains().getDomainUsers('contractId', 'domainId', null, null).then((result: any) => {
                    expect(result.items.length).toBe(2);
                    expect(result.items[0].firstName).toBe('joe');
                    expect(result.items[0].id).toBe('joe@foo.com');
                    expect(result.items[0].fullName).toBe('joe black');
                    expect(result.items[1].fullName).toBe('noe red');
                });
            });

            it('should returns empty domain users', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/users',
                    {
                        status: 200,
                        body: usersPayload
                    }
                );

                return createDomains()
                    .getDomainUsers('contractId', 'domainId', null, { next: null })
                    .then((result: any) => {
                        expect(result.items.length).toBe(0);
                    });
            });

            it('should use paging next when getting result', () => {
                fetchMock.mock(
                    '/gdc/admin/contracts/contractId/domains/domainId/users?limit=10',
                    {
                        status: 200,
                        body: usersPayload
                    }
                );

                return createDomains()
                    .getDomainUsers(
                        'contractId',
                        'domainId',
                        null,
                        { next: '/gdc/admin/contracts/contractId/domains/domainId/users?limit=10' }
                    )
                    .then((result: any) => {
                        expect(result.items.length).toBe(2);
                        expect(result.items[0].id).toBe('joe@foo.com');
                    });
            });
        });
    });
});
