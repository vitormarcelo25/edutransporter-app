package io.github.David_Rn01.API_OFC.repository;

import io.github.David_Rn01.API_OFC.model.Presenca;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PresencaRepository extends JpaRepository<Presenca, Integer> {
    Optional<Presenca> findById(Integer id);
    boolean existsById(Integer id);
}
