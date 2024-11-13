package kr.or.nextit.backend.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.type.JdbcType;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

@Configuration
@MapperScan(basePackages = "kr.or.nextit.backend.mapper")
public class MyBatisConfig {

    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean sqlSessionFactory = new SqlSessionFactoryBean();
        sqlSessionFactory.setDataSource(dataSource);

        // Set mapper XML locations
        sqlSessionFactory.setMapperLocations(
                new PathMatchingResourcePatternResolver().getResources("classpath:/mappers/*.xml")
        );

        // Configure MyBatis to map underscore to camel case
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
        configuration.setMapUnderscoreToCamelCase(true); // Enable mapping
        sqlSessionFactory.setConfiguration(configuration);

        return sqlSessionFactory.getObject();
    }
}
