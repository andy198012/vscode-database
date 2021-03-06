
import { PostgreSQLType } from './postgresql';


describe('PostgreSQL type', () => {
    let serverInstance: any;
    beforeAll(() => {
        serverInstance = new PostgreSQLType();
    });

    it('correct split many query', () => {

        const queries = serverInstance.splitQueries('SELECT * FROM `table1`;SELECT * FROM `table2`;');

        expect(queries).toHaveLength(2);
        expect(queries[0]).toEqual('SELECT * FROM `table1`');
        expect(queries[1]).toEqual('SELECT * FROM `table2`');
    });

    it('delete empty query', () => {

        const queries = serverInstance.splitQueries(';;;;;SELECT * FROM `table1`;;;;;SELECT * FROM `table2`;;;;;;');

        expect(queries).toHaveLength(2);
        expect(queries[0]).toEqual('SELECT * FROM `table1`');
        expect(queries[1]).toEqual('SELECT * FROM `table2`');
    });

    it('test double dash comments, with nested and escaped quotes', () => {
        const queries = serverInstance.removeComments(`
                SELECT col FROM --comment
                \`table1\` AS ' \\' "\` --not a "comment\`';
        `);
        expect(queries).toEqual(`
                SELECT col FROM 
                \`table1\` AS ' \\' "\` --not a "comment\`';
        `);
    });

    it('test c-style comments, with nested and escaped quotes', () => {
        const queries = serverInstance.removeComments(`
                SELECT col FROM /* comment */ \`table1\` AS ' \\' "\` -/* not a " comment */ \`';
        `);
        expect(queries).toEqual(`
                SELECT col FROM  \`table1\` AS ' \\' "\` -/* not a " comment */ \`';
        `);
    });


    it('test misc comments, with nested and escaped quotes', () => {
        const queries = serverInstance.removeComments(`
                SELECT col FROM 
                --
                --a comment
                \`table1\` AS ' \\' "\` --not a " comment /* neither */ \`';
        `);
        expect(queries).toEqual(`
                SELECT col FROM 
                
                
                \`table1\` AS ' \\' "\` --not a " comment /* neither */ \`';
        `);
    });
    
});
