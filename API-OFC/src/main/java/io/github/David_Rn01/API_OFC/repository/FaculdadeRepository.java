package io.github.David_Rn01.API_OFC.repository;

import io.github.David_Rn01.API_OFC.model.Faculdade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FaculdadeRepository extends JpaRepository<Faculdade, Integer> {
    Optional<Faculdade> findByNomeIgnoreCase(String nome);

    boolean existsByNomeAndCidadeId(String nome, Integer cidadeId);
}
